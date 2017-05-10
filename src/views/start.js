import React, { Component } from 'react';
import {
	View,
	Text,
	NativeAppEventEmitter,
	StyleSheet,
	TouchableHighlight,
	ScrollView,
} from 'react-native';

import { connect } from 'react-redux';
import { bleStart, bleScanStart, bleScanEnded, bleConnect } from '../actions/actions';

class Start extends Component {

	constructor(props) {
		super(props);
	}

	componentDidMount() {
		this.props.bleStart();
		this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);
		this.handleScanEnded = this.handleScanEnded.bind(this);
		NativeAppEventEmitter
			.addListener('BleManagerStopScan', this.handleScanEnded);
	}

	handleDiscoverPeripheral() {

	}

	handleScanEnded() {
		this.props.bleScanEnded();
	}

	handleScanPress() {
		let { scanning } = this.props.ble;
		if (!scanning) this.props.bleScanStart();
	}

	handleConnectPress(device) {
		console.log('handleConnectPress', device.id);
		this.props.bleConnect(device);
	}

	render() {
		let that = this;
		let { started, startError, scanning, scanError, peripherals,
			connectError } = this.props.ble;
		console.log(this.props.ble);

		function scanText() {
			if (scanning) return <Text style={text}>Scanning...</Text>
			else return <Text style={text}>Press to Scan</Text>
		}

		function renderFoundDevices() {
			console.log(peripherals);
			return peripherals.map((device)=> {
				return (
				<TouchableHighlight 
					onPress={that.handleConnectPress.bind(that, device)} 
					key={device.id} 
					style={[deviceBox, {backgroundColor: device.connected ? 'cyan' : 'white'}]}>
					<View><Text style={textSmall}>Name: {device.name}</Text>
					<Text style={textSmall}>ID: {device.id}</Text></View>
				</TouchableHighlight>
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
				<View style={{height: 50, width: 200, alignItems: 'center', marginTop: 15}}>
					<Text style={text}>Found {peripherals.length} devices</Text>
				</View>
				{started && 
					<TouchableHighlight onPress={this.handleScanPress.bind(this)} style={button}>
						{scanText()}
					</TouchableHighlight>
				}
				{!started && startError &&
					<View style={button}>
						<Text>Error starting BLE: {startError}</Text>
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
		paddingBottom: 50,
	},
	button: {
		width: 200,
		height: 60,
		borderWidth: 2,
		borderRadius: 5,
		justifyContent: 'center',
		alignItems: 'center',
	},
	deviceBox: {
		width: 300,
		height: 60,
		borderWidth: 1,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 15,
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
});
const { 
	container, 
	button, 
	text, 
	textSmall, 
	deviceBox,
	scrollView } 
	= styles;

function mapStateToProps(state) {
  return {
    ble: state.ble
  };
}

function mapDispatchToProps(dispatch) {
  return {
    bleStart: () => dispatch(bleStart()),
    bleScanStart: () => dispatch(bleScanStart()),
    bleScanEnded: () => dispatch(bleScanEnded()),
    bleConnect: (device) => dispatch(bleConnect(device)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Start);