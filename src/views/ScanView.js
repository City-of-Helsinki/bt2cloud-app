import React, { Component } from 'react';
import {
	View,
	Text,
	NativeAppEventEmitter,
	StyleSheet,
	TouchableHighlight,
	ScrollView,
	ActivityIndicator,
	Dimensions,
	AppState,
	Platform,
	Vibration,
} from 'react-native';

import Toast from '@remobile/react-native-toast';
import BleManager from 'react-native-ble-manager';
import { Actions } from 'react-native-router-flux';

import realm from '../realm';

import { connect } from 'react-redux';
import { 
	bleStart, 
	bleScanStart, 
	bleScanStop,
	bleScanEnded, 
	bleConnect, 
	bleConnecting,
	bleDisconnect,
	getConnectedPeripherals,
	getAvailablePeripherals,
	bleUpdateAvailablePeripherals,
	bleAppendReadHistory, 
	bleNotifyStopped,
	bleFavoriteAdd,
	bleFavoriteRemove,
} from '../actions/actions';

import {
	FILE_TAG_DATA
} from '../constants';

import Utils from '../utils/utils';
import DeviceBox from '../components/DeviceBox';

class ScanView extends Component {

	constructor(props) {
		super(props);
		this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);
		this.handleScanEnded = this.handleScanEnded.bind(this);
		this.handleConnectPeripheral = this.handleConnectPeripheral.bind(this);
		this.handleDisconnectPeripheral = this.handleDisconnectPeripheral.bind(this);
		this.handleNotification = this.handleNotification.bind(this);
		this.handleAutoConnect = this.handleAutoConnect.bind(this);
		this.scanEndedListener = NativeAppEventEmitter
			.addListener('BleManagerStopScan', this.handleScanEnded);
		this.discoverPeripheralListener = NativeAppEventEmitter
			.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral);
		this.connectPeripheralListener = NativeAppEventEmitter
			.addListener('BleManagerConnectPeripheral', this.handleConnectPeripheral);
		this.disconnectPeripheralListener = NativeAppEventEmitter
			.addListener('BleManagerDisconnectPeripheral', this.handleDisconnectPeripheral);		
		this.notificationListener = NativeAppEventEmitter
			.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleNotification);		
	}

	componentDidMount() {
		this.props.bleStart(BleManager);
	}

	componentWillUnmount() {
		this.scanEndedListener.remove();
		this.discoverPeripheralListener.remove();
		this.connectPeripheralListener.remove();
		this.disconnectPeripheralListener.remove();
		this.notificationListener.remove();
	}

	componentDidUpdate() {
		// handle auto connect whenever applicable
		this.handleAutoConnect();
		
		// if service started and startScanByDefault is true, start scan immediately
		if (this.props.ble.started && !this.props.ble.scanning
			&& this.props.ble.startScanByDefault) {
			this.props.bleScanStart(BleManager);
			this.props.getConnectedPeripherals(BleManager);
		}		
	}

	// this gets called multiple times per device upon discovery
	// cannot be prevented on android
	handleDiscoverPeripheral(peripheral) {
		this.props.bleUpdateAvailablePeripherals(peripheral, null);
	}

	handleConnectPeripheral(data) {		
		this.props.getConnectedPeripherals(BleManager);
		let deviceName = data.peripheral;
		if (AppState.currentState === 'active') {
			Toast.showShortCenter('Connected to ' + deviceName);		
		}
		// this.props.getAvailablePeripherals();
	}

	handleDisconnectPeripheral(data) {
		if (!data) return;
		if (!data.hasOwnProperty('peripheral')) return;
		let deviceID = data.peripheral;
		let { notifyingChars, peripheralServiceData } = this.props.ble;

		if (AppState.currentState === 'active') {
			Toast.showShortCenter('Disconnected from ' + deviceID);
		}
		else {
			Vibration.vibrate();
		}
		

		if (peripheralServiceData && peripheralServiceData.length > 0) {

			// TODO REMOVE ALL NOTIFYING CHARS FROM STATE ON DISCONNECT
			let disconnectedDevicesChars = notifyingChars.filter(c=>c.deviceID === deviceID)
				.map(ch=>ch.characteristic);
			disconnectedDevicesChars.forEach(dc => this.props.bleNotifyStopped(dc));
		}
		
		this.props.getConnectedPeripherals(BleManager);
		// this.props.getAvailablePeripherals();
	}

	handleNotification(data) {
		if (!data) return;
		let deviceID = data.peripheral;
		let characteristic = data.characteristic
		let service = data.service
		let hex = data.value;
		let ascii = Utils.hexDecode(hex);
    let jsonObject = {
      deviceID,
      service,
      characteristic,
      hex,
      ascii,
      time: new Date(),
    };
    realm.write(() => {
      realm.create('Data', jsonObject);
    });
    Utils.writeToFile(jsonObject, FILE_TAG_DATA);

		// prevent UI re-rendering in background
		if (AppState.currentState === 'active') {
			this.props.bleAppendReadHistory(deviceID, service, characteristic, hex);
		}
	}

	handleScanEnded() {
		this.props.getAvailablePeripherals(BleManager);
		this.props.bleScanEnded();
	}

	handleScanPress() {
		let { scanning } = this.props.ble;
		if (scanning) {
			this.props.bleScanStop(BleManager); 
		}
		else {
			if (Platform.OS === 'android') {
				BleManager.enableBluetooth()
					.then(()=> {
						// this.props.getAvailablePeripherals();
						this.props.bleScanStart(BleManager);						
					})
					.catch((err)=> {
						console.log('User refused to enable Bluetooth');
					});
			}
			else {
				// this.props.getAvailablePeripherals();
				this.props.bleScanStart(BleManager);
			}
		}
		this.props.getConnectedPeripherals(BleManager);
	}

	handleConnectPress(device) {
		let connected = this.props.ble.connectedPeripherals.map(p=>p.id).includes(device.id);
		if (connected) {
			this.props.bleDisconnect(BleManager, device) 
		}
		else {
			this.props.bleConnecting(device);
			this.props.bleConnect(BleManager, realm, device);
		}	
	}

	handleInfoPress(device) {
		if (!device) return;
		detailedDevice = this.props.ble.peripheralServiceData.filter(p=>p.id === device.id)[0];
		if (!detailedDevice) return;
		Actions.DeviceDetailView({title: device.name, device: detailedDevice});
	}

	handleFavoritePress(device, favorite) {
		if (!device) return;
		if(favorite) {
			this.props.bleFavoriteRemove(realm, device);
			Toast.showLongBottom('Removed favorite. Auto-connect and auto-subscribe are now OFF.');
		}
		else {
			this.props.bleFavoriteAdd(realm, device);
			Toast.showLongBottom('Added favorite. Auto-connect and auto-subscribe are now ON.');
		} 
	}

	handleAutoConnect() {
		// If device is set to autoConnect in DB, try to connect (unless already connected/connecting)
		let { peripherals, connectedPeripherals, connectingPeripherals, knownPeripherals} = this.props.ble;
		let autoConnectPeripherals = knownPeripherals.filter(p=>p.autoConnect === true);

		autoConnectPeripherals.forEach((per) => {
			let inRange = peripherals.map(p=>p.id).includes(per.id);
			let connected = connectedPeripherals.map(p=>p.id).includes(per.id);
			let connecting = connectingPeripherals.includes(per.id);

			if (inRange && !connected && !connecting) {
				console.log('attempting to autoconnect');
				this.props.bleConnecting(per);
				this.props.bleConnect(BleManager, realm, per);
			}
		});
	}

	render() {
		let that = this;
		let { started, startError, scanning, scanError, peripherals, connectedPeripherals,
			connectingPeripherals, knownPeripherals, connectError } = this.props.ble;
		let favoritePeripherals = knownPeripherals.filter(p=>p.favorite === true);

		function scanText() {
			if (scanning) return <Text style={buttonText}>Press to Stop</Text>
			else return <Text style={buttonText}>Press to Scan</Text>
		}

		function renderFoundDevices() {
			let unavailableDevices = knownPeripherals.filter(p=>{
				let availableIDs = peripherals.map(p2=>p2.id);
				let connectedIDs = connectedPeripherals.map(p3=>p3.id);
				return !availableIDs.includes(p.id) && !connectedIDs.includes(p.id);
			});
			
			allDevices = peripherals.concat(unavailableDevices).map((device)=> {
				let connected = connectedPeripherals.map(p=>p.id).includes(device.id);
				let connecting = connectingPeripherals.includes(device.id);
				let favorite = favoritePeripherals.map(p=>p.id).includes(device.id);
				let inRange = peripherals.map(p=>p.id).includes(device.id);
				return (
				<DeviceBox
					mainAreaPress={connected ? that.handleInfoPress.bind(that, device) : that.handleConnectPress.bind(that, device)} 
					disconnectPress={that.handleConnectPress.bind(that, device)}
					favPress={that.handleFavoritePress.bind(that, device, favorite)}
					key={device.id} 
					device={device}
					favorite={favorite}
					connecting={connecting}
					connected={connected}
					inRange={inRange}
					style={[
						deviceBox, 
						{
							backgroundColor: !inRange ? '#555' : connected ? 'navy' : connecting ? '#BBF': 'white',
						}]
					}>
				</DeviceBox>
				);
			});

			// sort first by connection status, then by availability, then favoriteness
			return allDevices.sort((a,b)=> {
				if (a.props.connected === b.props.connected) {
					if (a.props.inRange === b.props.inRange) {
						return a.props.favorite === b.props.favorite ? 0 : a.props.favorite ? -1 : 1;
					}
					else {
						return a.props.inRange ? -1 : 1;
					}
				}
				else {
					return a.props.connected ? -1 : 1;
				}
			});
		}

		return (
			<View style={container}>
				<ScrollView>
					<View style={scrollView}>
					{connectError && <Text>{connectError}</Text>}
					{renderFoundDevices()}
					</View>
				</ScrollView>
				<View style={deviceAmount}>
					<Text style={text}>In range: {peripherals.length}, connected to: {connectedPeripherals.length}</Text>
					{peripherals.length > 0 && <Text style={textSmall}>Tap device to connect</Text>}
				</View>
				{started && 
					<TouchableHighlight onPress={this.handleScanPress.bind(this)} style={button}>
						<View style={{flexDirection: 'row'}}>
							<View>
								{scanText()}					
							</View>
							{scanning && <ActivityIndicator style={spinner} color='white' />}		
						</View>
					</TouchableHighlight>
				}
				{!started && startError &&
					<View style={button}>
						<Text style={buttonText}>Error starting BLE: {startError}</Text>
					</View>
				}
			</View>
		);
	}
}

styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'flex-end',
		paddingBottom: 20,
	},
	button: {
		width: 200,
		height: 60,
		borderRadius: 5,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'navy',
	},
	buttonText: {
		color: 'white',
		fontSize: 20,
	},
	deviceBox: {
		width: Dimensions.get('window').width - 20,
		height: 60,
		borderWidth: 1,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 15,
		borderColor: 'navy',
	},
	text: {
		fontSize: 16,
		color: 'black',
		textAlign: 'center',
	},
	textSmall: {
		fontSize: 12,
		color: 'black',
		textAlign: 'center',
	},
	scrollView: {
		flex: 1,
		justifyContent: 'flex-end',
		alignItems: 'center',
	},
	deviceAmount: {
		width: 260, 
		alignItems: 'center', 
		marginTop: 5,
		marginBottom: 5,
	},
	spinner: {
		marginLeft: 10,
	}
});
const { 
	container, 
	button,
	buttonText, 
	text, 
	textSmall, 
	deviceBox,
	scrollView,
	deviceAmount,
	spinner,
} = styles;

function mapStateToProps(state) {
  return {
    ble: state.ble
  };
}

function mapDispatchToProps(dispatch) {
  return {
    bleStart: (BleManager) => dispatch(bleStart(BleManager)),
    bleScanStart: (BleManager) => dispatch(bleScanStart(BleManager)),
		bleScanStop: (BleManager) => dispatch(bleScanStop(BleManager)),    
    bleScanEnded: () => dispatch(bleScanEnded()),
    bleConnect: (BleManager, realm, device) => dispatch(bleConnect(BleManager, realm, device)),
    bleConnecting: (device) => dispatch(bleConnecting(device)),
    bleDisconnect: (BleManager,device) => dispatch(bleDisconnect(BleManager,device)),
    getAvailablePeripherals: (BleManager) => dispatch(getAvailablePeripherals(BleManager)),
    getConnectedPeripherals: (BleManager) => dispatch(getConnectedPeripherals(BleManager)),
    bleUpdateAvailablePeripherals: (peripheral, peripherals) => 
    	dispatch(bleUpdateAvailablePeripherals(peripheral, peripherals)),
    bleAppendReadHistory: (deviceID, service, characteristic, hex) => dispatch(
    	bleAppendReadHistory(deviceID, service, characteristic, hex)),
    bleNotifyStopped: (characteristic) => dispatch(bleNotifyStopped(characteristic)),
    bleFavoriteAdd: (realm, device) => dispatch(bleFavoriteAdd(realm, device)),
    bleFavoriteRemove: (realm, device) => dispatch(bleFavoriteRemove(realm, device)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ScanView);