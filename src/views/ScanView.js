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

import { connect } from 'react-redux';
import { 
	bleStart, 
	bleScanStart, 
	bleScanStop,
	bleScanEnded, 
	bleConnect, 
	bleDisconnect,
	getConnectedPeripherals,
	getAvailablePeripherals 
} from '../actions/actions';

import DeviceBox from '../components/DeviceBox';

class ScanView extends Component {

	constructor(props) {
		super(props);
		this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);
		this.handleScanEnded = this.handleScanEnded.bind(this);
		this.handleConnectPeripheral = this.handleConnectPeripheral.bind(this);
		this.handleDisconnectPeripheral = this.handleDisconnectPeripheral.bind(this);
		NativeAppEventEmitter
			.addListener('BleManagerStopScan', this.handleScanEnded);
		NativeAppEventEmitter
			.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral);
		NativeAppEventEmitter
			.addListener('BleManagerConnectPeripheral', this.handleConnectPeripheral);
		NativeAppEventEmitter
			.addListener('BleManagerDisconnectPeripheral', this.handleDisconnectPeripheral);		
	}

	componentDidMount() {
		this.props.bleStart();
		
		setTimeout(() => {
			if (this.props.ble.scanning) {
				this.props.getAvailablePeripherals();
			}
		}, 1000);
	}

	// this gets called multiple times per device upon discovery
	// cannot be prevented on android
	handleDiscoverPeripheral(data) {
		console.log(data);
		this.props.getAvailablePeripherals();
	}

	handleConnectPeripheral() {
		console.log('handleConnectPeripheral');
		this.props.getConnectedPeripherals();
	}

	handleDisconnectPeripheral() {
		console.log('handleDisconnectPeripheral');
		this.props.getConnectedPeripherals();
	}

	handleScanEnded() {
		this.props.bleScanEnded();
	}

	handleScanPress() {
		let { scanning } = this.props.ble;
		scanning ? this.props.bleScanStop() : this.props.bleScanStart();
	}

	handleConnectPress(device) {
		let connected = this.props.ble.connectedPeripherals.map(p=>p.id).includes(device.id);
		connected ? this.props.bleDisconnect(device) : this.props.bleConnect(device);
	}

	handleInfoPress(device) {

		detailedDevice = this.props.ble.peripheralsWithServices.filter(p=>p.id === device.id)[0];
		Actions.DeviceDetailView({title: device.name, device: detailedDevice});
	}

	render() {
		let that = this;
		let { started, startError, scanning, scanError, peripherals, connectedPeripherals,
			peripheralsWithServices, connectError } = this.props.ble;
		console.log(this.props.ble);
		console.log(typeof startError);
		console.log(peripheralsWithServices.length);

		function scanText() {
			if (scanning) return <Text style={buttonText}>Press to Stop</Text>
			else return <Text style={buttonText}>Press to Scan</Text>
		}

		function renderFoundDevices() {
			console.log(peripherals);
			return peripherals.map((device)=> {
				let connected = connectedPeripherals.map(p=>p.id).includes(device.id);
				return (
				<DeviceBox
					onPress={that.handleConnectPress.bind(that, device)} 
					infoPress={that.handleInfoPress.bind(that, device)}
					key={device.id} 
					device={device}
					connected={connected}
					style={[
						deviceBox, 
						{
							backgroundColor: connected ? 'navy' : 'white',
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
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ScanView);