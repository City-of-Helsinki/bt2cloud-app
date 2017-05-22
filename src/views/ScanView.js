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
} from 'react-native';

import { Actions } from 'react-native-router-flux';

import realm from '../realm';

import { connect } from 'react-redux';
import { 
	bleStart, 
	bleScanStart, 
	bleScanStop,
	bleScanEnded, 
	bleConnect, 
	bleDisconnect,
	getConnectedPeripherals,
	getAvailablePeripherals,
	bleAppendReadHistory, 
	bleNotifyStopped,
	bleFavoriteAdd,
	bleFavoriteRemove,
} from '../actions/actions';

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
		this.props.bleStart();
	}

	componentWillUnmount() {
		this.scanEndedListener.remove();
		this.discoverPeripheralListener.remove();
		this.connectPeripheralListener.remove();
		this.disconnectPeripheralListener.remove();
		this.notificationListener.remove();
	}

	componentDidUpdate() {
		// if service started and startScanByDefault is true, start scan immediately
		if (this.props.ble.started && !this.props.ble.scanning
			&& this.props.ble.startScanByDefault) {
			this.props.bleScanStart();
			this.props.getConnectedPeripherals();
		}
	}

	// this gets called multiple times per device upon discovery
	// cannot be prevented on android
	handleDiscoverPeripheral(data) {
		console.log(data);
		this.props.getAvailablePeripherals();
	}

	handleConnectPeripheral(data) {
		console.log('handleConnectPeripheral');
		console.log(data);
		this.props.getConnectedPeripherals();
		this.props.getAvailablePeripherals();
	}

	handleDisconnectPeripheral(data) {
		if (!data) return;
		console.log('handleDisconnectPeripheral', data);
		if (!data.hasOwnProperty('peripheral')) return;
		let deviceID = data.peripheral;
		let { notifyingChars, peripheralServiceData } = this.props.ble;

		if (peripheralServiceData && peripheralServiceData.length > 0) {

			// TODO REMOVE ALL NOTIFYING CHARS FROM STATE ON DISCONNECT
			let disconnectedDevicesChars = notifyingChars.filter(c=>c.deviceID === deviceID)
				.map(ch=>ch.characteristic);
			console.log('disc device chars:', disconnectedDevicesChars);
			disconnectedDevicesChars.forEach(dc => this.props.bleNotifyStopped(dc));
		}
		
		this.props.getConnectedPeripherals();
		this.props.getAvailablePeripherals();
	}

	handleNotification(data) {
		if (!data) return;
		console.log ('new notification! ', Utils.hexDecode(data.value));
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
    Utils.writeToFile(jsonObject);

		// prevent UI re-rendering in background
		if (AppState.currentState === 'active') {
			this.props.bleAppendReadHistory(deviceID, service, characteristic, hex);
		}
	}

	handleScanEnded() {
		this.props.bleScanEnded();
	}

	handleScanPress() {
		let { scanning } = this.props.ble;
		scanning ? this.props.bleScanStop() : this.props.bleScanStart();
		this.props.getConnectedPeripherals();
	}

	handleConnectPress(device) {
		let connected = this.props.ble.connectedPeripherals.map(p=>p.id).includes(device.id);
		connected ? this.props.bleDisconnect(device) : this.props.bleConnect(device);
	}

	handleInfoPress(device) {

		detailedDevice = this.props.ble.peripheralServiceData.filter(p=>p.id === device.id)[0];
		Actions.DeviceDetailView({title: device.name, device: detailedDevice});
	}

	handleFavoritePress(device, favorite) {
		if (!device) return;
		favorite ? this.props.bleFavoriteRemove(device) : this.props.bleFavoriteAdd(device);
	}

	render() {
		let that = this;
		let { started, startError, scanning, scanError, peripherals, connectedPeripherals,
			knownPeripherals, connectError } = this.props.ble;
		// console.log(this.props.ble);
		let favoritePeripherals = knownPeripherals.filter(p=>p.favorite === true);

		function scanText() {
			if (scanning) return <Text style={buttonText}>Press to Stop</Text>
			else return <Text style={buttonText}>Press to Scan</Text>
		}

		function renderFoundDevices() {
			console.log(knownPeripherals);
			let unavailableDevices = knownPeripherals.filter(p=>{
				let availableIDs = peripherals.map(p2=>p2.id);

				return !availableIDs.includes(p.id);
			});
			
			allDevices = peripherals.concat(unavailableDevices).map((device)=> {
				let connected = connectedPeripherals.map(p=>p.id).includes(device.id);
				let favorite = favoritePeripherals.map(p=>p.id).includes(device.id);
				let inRange = peripherals.map(p=>p.id).includes(device.id);
				return (
				<DeviceBox
					connectPress={that.handleConnectPress.bind(that, device)} 
					infoPress={that.handleInfoPress.bind(that, device)}
					favPress={that.handleFavoritePress.bind(that, device, favorite)}
					key={device.id} 
					device={device}
					favorite={favorite}
					connected={connected}
					inRange={inRange}
					style={[
						deviceBox, 
						{
							backgroundColor: !inRange ? '#555' : connected ? 'navy' : 'white',
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
					<Text style={text}>Found {peripherals.length} devices</Text>
					{peripherals.length > 0 && <Text style={textSmall}>tap to connect/disconnect</Text>}
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
		fontSize: 24,
		color: 'black',
	},
	textSmall: {
		fontSize: 16,
		color: 'black',
	},
	scrollView: {
		flex: 1,
		justifyContent: 'flex-end',
		alignItems: 'center',
	},
	deviceAmount: {
		width: 200, 
		alignItems: 'center', 
		marginTop: 15,
		marginBottom: 25,
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
    bleStart: () => dispatch(bleStart()),
    bleScanStart: () => dispatch(bleScanStart()),
		bleScanStop: () => dispatch(bleScanStop()),    
    bleScanEnded: () => dispatch(bleScanEnded()),
    bleConnect: (device) => dispatch(bleConnect(device)),
    bleDisconnect: (device) => dispatch(bleDisconnect(device)),
    getAvailablePeripherals: () => dispatch(getAvailablePeripherals()),
    getConnectedPeripherals: () => dispatch(getConnectedPeripherals()),
    bleAppendReadHistory: (deviceID, service, characteristic, hex) => dispatch(
    	bleAppendReadHistory(deviceID, service, characteristic, hex)),
    bleNotifyStopped: (characteristic) => dispatch(bleNotifyStopped(characteristic)),
    bleFavoriteAdd: (device, favorite) => dispatch(bleFavoriteAdd(device, favorite)),
    bleFavoriteRemove: (device, favorite) => dispatch(bleFavoriteRemove(device, favorite)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ScanView);