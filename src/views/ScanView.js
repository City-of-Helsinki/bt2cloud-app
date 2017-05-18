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

import DeviceBox from '../components/DeviceBox';

class ScanView extends Component {

	constructor(props) {
		super(props);
		this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);
		this.handleScanEnded = this.handleScanEnded.bind(this);
		this.handleConnectPeripheral = this.handleConnectPeripheral.bind(this);
		this.handleDisconnectPeripheral = this.handleDisconnectPeripheral.bind(this);
		this.handleNotification = this.handleNotification.bind(this);
		NativeAppEventEmitter
			.addListener('BleManagerStopScan', this.handleScanEnded);
		NativeAppEventEmitter
			.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral);
		NativeAppEventEmitter
			.addListener('BleManagerConnectPeripheral', this.handleConnectPeripheral);
		NativeAppEventEmitter
			.addListener('BleManagerDisconnectPeripheral', this.handleDisconnectPeripheral);		
		NativeAppEventEmitter
			.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleNotification);		
	}

	componentDidMount() {
		this.props.bleStart();
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

		let name;
		try {
			let name = this.props.ble.peripherals.filter(p=>p.id === data.peripheral)[0].name || undefined;
		}
		catch(err) {
			name = undefined;
		}

		if (!name) return;
  	realm.write(() => {
      realm.create('Device', {
      	name,
      	id: data.peripheral,
      }, true);
  	});		
	}

	handleDisconnectPeripheral(data) {
		console.log('handleDisconnectPeripheral', data);
		if (!data.hasOwnProperty('peripheral')) return;
		let deviceID = data.peripheral;
		let { notifyingChars, peripheralsWithServices } = this.props.ble;

		if (peripheralsWithServices && peripheralsWithServices.length > 0) {

			// TODO REMOVE ALL NOTIFYING CHARS FROM STATE ON DISCONNECT
			/*if (notifyingChars.map(c=>c.deviceID).includes(deviceID)) {
				this.props.bleNotifyStopped(deviceChars[char]);
			}*/
		}
		
		this.props.getConnectedPeripherals();
		this.props.getAvailablePeripherals();
	}

	handleNotification(data) {

		let deviceID = data.peripheral, characteristic = data.characteristic, service = data.service, hex = data.value;
		this.props.bleAppendReadHistory(deviceID, service, characteristic, hex);
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

		detailedDevice = this.props.ble.peripheralsWithServices.filter(p=>p.id === device.id)[0];
		Actions.DeviceDetailView({title: device.name, device: detailedDevice});
	}

	handleFavoritePress(device, favorite) {
		if (!device) return;
		favorite ? this.props.bleFavoriteRemove(device) : this.props.bleFavoriteAdd(device);
	}

	render() {
		let that = this;
		let { started, startError, scanning, scanError, peripherals, connectedPeripherals,
			peripheralsWithServices, connectError } = this.props.ble;
		console.log(this.props.ble);
		let favoritePeripherals = peripheralsWithServices.filter(p=>p.favorite === true);

		function scanText() {
			if (scanning) return <Text style={buttonText}>Press to Stop</Text>
			else return <Text style={buttonText}>Press to Scan</Text>
		}

		function renderFoundDevices() {
			console.log(peripheralsWithServices);
			let unavailableDevices = peripheralsWithServices.filter(p=>{
				let availableIDs = peripherals.map(p2=>p2.id);

				return !availableIDs.includes(p.id);
			});
			
			allDevices = peripherals.concat(unavailableDevices);

			return allDevices.map((device)=> {
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