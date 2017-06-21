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

import { Buffer } from 'buffer';
import Toast from '@remobile/react-native-toast';
import BleManager from 'react-native-ble-manager';
import BGTimer from 'react-native-background-timer';
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
	bleNotify,
	bleNotifyStopped,
	bleModifyDevice,
} from '../actions/actions';

import {
	FILE_TAG_DATA
} from '../constants';

import eventHandlers from '../utils/eventHandlers';

import Colors from '../colors';
import store from '../store';
import Utils from '../utils/utils';
import DeviceBox from '../components/DeviceBox';

class ScanView extends Component {

	constructor(props) {
		super(props);

	}

	componentDidMount() {
		if (!this.props.ble.started && !this.props.ble.starting) this.props.bleStart(BleManager);
		try {
			this.props.getConnectedPeripherals(BleManager);
			this.props.getAvailablePeripherals(BleManager);
		}
		catch(err) {
			console.log('not initialized. this is fine.');
		}
	}

	componentDidUpdate() {
		if (this.props.ble.started && !this.props.ble.scanStarting && !this.props.ble.scanning
			&& this.props.ble.startScanByDefault) {
			this.props.bleScanStart(BleManager);
			this.props.getConnectedPeripherals(BleManager);
		}
	}

	handleScanPress() {
		let { scanning } = this.props.ble;
		console.log('scan button press, current scanning status: ' + scanning);
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
		let hasAutoConnect = this.props.ble.knownPeripherals.filter(p=>p.autoConnect === true & p.id === device.id).length > 0;

		if (connected) {
			this.props.bleDisconnect(BleManager, device)
		}
		else {
			this.props.bleConnecting(device);
			this.props.bleConnect(BleManager, realm, device, hasAutoConnect);
		}
	}

	handleInfoPress(device) {
		if (!device) return;
		BleManager.retrieveServices(device.id)
			.then((s) => {
				Actions.DeviceDetailView({
					title: device.name,
					device: s,
				});
			})
			.catch((err) => {
				console.log(err);
			});

	}

	handleFavoritePress(device, favorite, connected) {
		if (!device) return;
		if(favorite) {
			this.props.bleModifyDevice(realm, device, false, false, false);
			Toast.showLongBottom('Removed favorite. Auto-connect and auto-record are now OFF.');
		}
		else {
			this.props.bleModifyDevice(realm, device, true, true, true);
			if (connected) eventHandlers.handleAutoNotify(device.id);
			else eventHandlers.handleAutoConnect([device]);
			Toast.showLongBottom('Added favorite. Auto-connect and auto-record are now ON.');
		}
	}

	render() {
		let that = this;
		let { started, startError, scanning, scanError, peripherals, connectedPeripherals,
			connectingPeripherals, knownPeripherals, connectError } = this.props.ble;
		let favoritePeripherals = knownPeripherals.filter(p=>p.favorite === true);
		console.log('Scanview render, scanning is ' + scanning);
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
					favPress={that.handleFavoritePress.bind(that, device, favorite, connected)}
					key={device.id}
					device={device}
					favorite={favorite}
					connecting={connecting}
					connected={connected}
					inRange={inRange}
					style={[
						deviceBox,
						{
							backgroundColor: !inRange ? '#555' : connected ? Colors.BLUE : connecting ? '#BBF': 'white',
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
		backgroundColor: Colors.BLUE,
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
		borderColor: Colors.BLUE,
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
    bleNotify: (BleManager, deviceID, charArray) =>
    	dispatch(bleNotify(BleManager, deviceID, charArray)),
    bleNotifyStopped: (characteristic) => dispatch(bleNotifyStopped(characteristic)),
    bleModifyDevice: (realm, device, favorite, autoConnect, autoNotify) =>
    	dispatch(bleModifyDevice(realm, device, favorite, autoConnect, autoNotify)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ScanView);
