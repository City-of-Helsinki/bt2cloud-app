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
	Dimensions,
} from 'react-native';

import { connect } from 'react-redux';

import { 
	bleConnect, 
	bleDisconnect,
} from '../actions/actions';

import ServiceBox from '../components/ServiceBox';
import CharBox from '../components/CharBox';

class DeviceDetailView extends Component {

	constructor(props) {
		super(props);
		this.handleReadPress = this.handleReadPress.bind(this);
		this.handleNotifyPress = this.handleNotifyPress.bind(this);
		this.handleConnectPress = this.handleConnectPress.bind(this);
	}

	componentDidMount() {
	}

	handleReadPress() {
		let { device } = this.props;
		let connected = connectedPeripherals.map(p=>p.id).includes(device.id);
		if (!connected) return;

		
	}

	handleNotifyPress() {
	}

	handleConnectPress() {
		let { device } = this.props;
		let connected = this.props.ble.connectedPeripherals.map(p=>p.id).includes(device.id);
		connected ? this.props.bleDisconnect(device) : this.props.bleConnect(device);
	}

	render() {
		let { started, startError, scanning, scanError, peripherals, connectedPeripherals,
			peripheralsWithServices, connectError } = this.props.ble;
		let { device } = this.props;
		console.log(device.services);
		let connected = connectedPeripherals.map(p=>p.id).includes(device.id);


		return (
			<View style={container}>
				<ScrollView>
					<View style={scrollView}>
						<TouchableHighlight onPress={this.handleConnectPress} style={button}>
							<Text style={buttonText}>{connected ? 'Disconnect' : 'Connect'}</Text>
						</TouchableHighlight>					
						{device.services.map(s => {
							let chars = device.characteristics.filter(c => c.service === s.uuid);
							console.log('chars: ', chars);
							return(
							<ServiceBox 
								key={s.uuid} 
								uuid={s.uuid} 
								connected={connected}
								style={[serviceBox, {backgroundColor: connected ? 'navy' : '#444' }]}>
								{chars.map(c=>{
									console.log('c: ', c);
									let read = c.properties.hasOwnProperty('Read') && c.properties.Read === 'Read';
									let notify = c.properties.hasOwnProperty('Notify') && c.properties.Notify === 'Notify';
									return (
										<CharBox
											key={c.characteristic}
											characteristic={c.characteristic}
											read={read}
											notify={notify}
											connected={connected}
											readPress={this.handleReadPress}
											notifyPress={this.handleNotifyPress}
											style={charBox}
										/>
									);
								})}
							</ServiceBox>
						)})}
					</View>
				</ScrollView>

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
		marginTop: 60,
	},
	button: {
		marginTop: 20,
		width: 150,
		height: 40,
		borderRadius: 5,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'navy',
	},
	buttonText: {
		color: 'white',
		fontSize: 20,
	},
	serviceBox: {
		width: Dimensions.get('window').width - 20,
		height: 60,
		borderWidth: 1,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 15,
		borderColor: 'navy',
		backgroundColor: 'navy',
	},
	charBox: {
		width: Dimensions.get('window').width - 20,
		minHeight: 30,
		borderWidth: 1,
		borderTopWidth: 0,
		justifyContent: 'center',
		alignItems: 'center',
		borderColor: 'navy',
		backgroundColor: 'white',
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
});

const { 
	container, 
	button,
	buttonText, 
	text, 
	textSmall, 
	serviceBox,
	charBox,
	scrollView,
} = styles;

function mapStateToProps(state) {
  return {
    ble: state.ble
  };
}

function mapDispatchToProps(dispatch) {
  return {
    bleConnect: (device) => dispatch(bleConnect(device)),
    bleDisconnect: (device) => dispatch(bleDisconnect(device)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DeviceDetailView);