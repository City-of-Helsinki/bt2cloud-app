import React, { Component } from 'react';
import {
	View,
	Text,
	NativeAppEventEmitter,
	StyleSheet,
	TouchableHighlight,
	ScrollView,
	ActivityIndicator,
	FlatList,
} from 'react-native';

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

class MyDevicesView extends Component {

	constructor(props) {
		super(props);
	}

	componentDidMount() {
	}

	render() {
		let that = this;
		let { started, startError, scanning, scanError, peripherals, connectedPeripherals,
			peripheralsWithServices, connectError } = this.props.ble;
		
		// Renders all devices with known services, sorted by connected ones first
		function renderKnownDevices() {
			peripheralList = peripheralsWithServices.map((device) => {
				let connected = connectedPeripherals.map(p=>p.id).includes(device.id);
				if (connected) {
					device['connected']=true;
				}
				else {
					device['connected']=false;
				}

				return device;
			});
			peripheralList.sort((p1, p2) => {

				return (p1.connected === p2.connected) ? 0 : p1.connected ? -1 : 1;
			});

			
			return peripheralList.map((device)=> {
				return (
					<DeviceBox
						onPress={()=>console.log('foo')} 
						key={device.id} 
						device={device}
						connected={device.connected}
						style={[
						deviceBox, 
						{
							backgroundColor: device.connected ? 'navy' : 'white',
						}]
					}				
					/>				
				);
			});
		}

		return (
			<View style={container}>
				<ScrollView>
					<View style={scrollView}>
					{connectError && <Text>{connectError}</Text>}
					{renderKnownDevices()}
					</View>
				</ScrollView>
				<View style={deviceAmount}>
					<Text style={text}>Connected to {connectedPeripherals.length} devices</Text>
					<Text style={text}>{peripheralsWithServices.length} devices with known services</Text>
				</View>
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
		width: 300,
		height: 60,
		borderWidth: 1,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 15,
		borderColor: 'navy',
	},
	text: {
		fontSize: 18,
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
		width: 300, 
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

export default connect(mapStateToProps, mapDispatchToProps)(MyDevicesView);