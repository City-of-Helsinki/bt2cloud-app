import React, { Component } from 'react';
import {
	View,
	Text,
	NativeAppEventEmitter,
	StyleSheet,
	TouchableHighlight,
} from 'react-native';

import { connect } from 'react-redux';
import { bleStart, bleScanStart, bleScanEnded } from '../actions/actions';

class Start extends Component {

	constructor(props) {
		super(props);
	}

	componentDidMount() {
		this.props.bleStart();
		this.handleScanEnded = this.handleScanEnded.bind(this);
		NativeAppEventEmitter
			.addListener('BleManagerStopScan', this.handleScanEnded);
	}

	handleScanEnded() {
		this.props.bleScanEnded();
	}

	handleScanPress() {
		let { scanning } = this.props.ble;
		if (!scanning) this.props.bleScanStart();
	}

	render() {
		let { started, startError, scanning, scanError, peripherals } = this.props.ble;
		console.log(this.props.ble);

		function scanText() {
			if (scanning) return <Text style={text}>Scanning...</Text>
			else return <Text style={text}>Press to Scan</Text>
		}

		function renderFoundDevices() {
			console.log(peripherals);
			return peripherals.map((device)=> {
				return (
				<View key={device.id} style={deviceBox}>
					<Text style={textSmall}>Name: {device.name}</Text>
					<Text style={textSmall}>ID: {device.id}</Text>
				</View>
				);
			});
		}
		
		return (
			<View style={container}>
				{renderFoundDevices()}
				<View style={{height: 50, width: 200, alignItems: 'center'}}>
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
		borderWidth: 0,
		justifyContent: 'center',
		alignItems: 'center',
	},
	text: {
		fontSize: 24,
		color: 'black',
	},
	textSmall: {
		fontSize: 16,
		color: 'black',
	}
});
const { 
	container, 
	button, 
	text, 
	textSmall, 
	deviceBox } 
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
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Start);