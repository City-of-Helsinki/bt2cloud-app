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
	AppState,
} from 'react-native';

import Switch from 'react-native-switch-pro';

import BleManager from 'react-native-ble-manager';
import { connect } from 'react-redux';

import realm from '../realm';
import { 
	bleConnect, 
	bleConnecting,
	bleDisconnect,
	bleRead,
	bleNotify,
	bleNotifyStop,
	bleModifyDevice,
} from '../actions/actions';
import Utils from '../utils/utils';
import Colors from '../colors';
import ServiceBox from '../components/ServiceBox';
import CharBox from '../components/CharBox';

class DeviceDetailView extends Component {

	constructor(props) {
		super(props);
		this.handleReadPress = this.handleReadPress.bind(this);
		this.handleNotifyPress = this.handleNotifyPress.bind(this);
		this.handleNotifyAllPress = this.handleNotifyAllPress.bind(this);
		this.handleConnectPress = this.handleConnectPress.bind(this);
	}

	shouldComponentUpdate() {
		return AppState.currentState === 'active';
	}

	handleReadPress(service, characteristic) {
		let { device } = this.props;
		let connected = this.props.ble.connectedPeripherals.map(p=>p.id).includes(device.id);
		if (!connected) return;
		this.props.bleRead(BleManager, realm, Utils, device.id, service, characteristic);
	}

	handleNotifyPress(service, characteristic, hasAutoNotify) {
		if (hasAutoNotify) return;
		let { device } = this.props;
		let connected = this.props.ble.connectedPeripherals.map(p=>p.id).includes(device.id);
		if (!connected) return;

		let notifying = this.props.ble.notifyingChars.map(c=>c.characteristic).includes(characteristic);
		notifying ? this.props.bleNotifyStop(BleManager, device.id, [{service, characteristic}]) 
			: this.props.bleNotify(BleManager, device.id, [{service, characteristic}]);
	}

	handleConnectPress() {
		let { device } = this.props;
		let connected = this.props.ble.connectedPeripherals.map(p=>p.id).includes(device.id);
		if (connected) {
			this.props.bleDisconnect(BleManager, device); 
		}
		else {
			this.props.bleConnecting(device);
			this.props.bleConnect(BleManager, realm, device);
		}	
	}

	handleNotifyAllPress(devicesNotifyingChars) {
		let { device} = this.props; 
		// All notifying chars, distinct from devicesNotifyingChars (current device only)
		let { notifyingChars } = this.props.ble;
		if (!device || !device.characteristics) return;

		// This device's characteristics that have Notify property
		let notifyableChars = device.characteristics.filter((c)=>{
			return c.properties.hasOwnProperty('Notify') && c.properties.Notify === 'Notify';
		});

		// If 1 or more chars currently notifying, stop them all
		if (notifyingChars.length > 0) {
			this.props.bleNotifyStop(BleManager, device.id, devicesNotifyingChars);
		}
		// Otherwise start notify on all
		else {
			// characteristics that are not notifying and their device is connected
	    let charArray = notifyableChars.filter((nc)=> {
	      let notifying = notifyingChars.map(c=>c.characteristic).includes(nc.characteristic);
	      let connected = this.props.ble.connectedPeripherals.map(p=>p.id).includes(device.id);
	      return !notifying && connected;
	    });
    	if (charArray.length > 0) this.props.bleNotify(BleManager, device.id, charArray); 
		}
	}

	handleSwitch(realm, device, willBeFavorite, willHaveAutoConnect, willHaveAutoNotify) {
		this.props.bleModifyDevice(realm, device, willBeFavorite, willHaveAutoConnect, willHaveAutoNotify);
		if (willHaveAutoNotify) this.props.handleAutoNotify(device.id);
	}

	render() {
		let { started, startError, scanning, scanError, peripherals, connectedPeripherals,
			knownPeripherals, connectError, readHistory, notifyingChars, connectingPeripherals,
			} = this.props.ble;
		let favoritePeripherals = knownPeripherals.filter(p=>p.favorite === true);
		let { device } = this.props;
		// This device's characteristics that are currently notifying
		device.notifyingChars = notifyingChars.filter(nc=>nc.deviceID === device.id);		

		let favorite = favoritePeripherals.map(p=>p.id).includes(device.id);
		let connected = connectedPeripherals.map(p=>p.id).includes(device.id);
		let connecting = connectingPeripherals.includes(device.id);
		let hasAutoNotify = this.props.ble.knownPeripherals.filter(
			p=>p.autoNotify === true & p.id === device.id).length > 0;
		let hasAutoConnect = this.props.ble.knownPeripherals.filter(
			p=>p.autoConnect === true & p.id === device.id).length > 0;		

		let canStartNotifyAll = connected && !hasAutoNotify; // autonotify is not on for this device
		return (
			<View style={container}>
				<ScrollView>
					<View style={scrollView}>
						<View style={deviceActionButtons}>
							<TouchableHighlight 
								onPress={this.handleConnectPress} 
								style={connected ? offButton : button}>
								<Text style={buttonText}>{connected ? 'Disconnect' : connecting ? 'Connecting...' : 'Connect'}</Text>
							</TouchableHighlight>
							<View style={switchContainer}>
								<Text>Auto-Connect</Text>
								<Switch 
									height={40}
									width={80}
									value={hasAutoConnect}
									backgroundActive={Colors.GREEN}
									backgroundInactive={Colors.GRAY}
									circleColor={Colors.WHITE}
									onSyncPress={() => this.handleSwitch(realm, device, favorite, !hasAutoConnect, hasAutoNotify)}
								/>
							</View>
						</View>
						<View style={deviceActionButtons}>
							<TouchableHighlight 
								onPress={canStartNotifyAll ? ()=>this.handleNotifyAllPress(device.notifyingChars) : () => {}} 
								style={!canStartNotifyAll ? disabledButton 
									: device.notifyingChars.length === 0 ? button : offButton }>
								<Text style={buttonText}>
									{device.notifyingChars.length === 0 ? 'Start record' : 'Stop record'}
								</Text>
							</TouchableHighlight>	
							<View style={switchContainer}>						
								<Text>Auto-Record</Text>			
								<Switch 
									height={40}
									width={80}							
									value={hasAutoNotify}
									backgroundActive={Colors.GREEN}
									backgroundInactive={Colors.GRAY}
									circleColor={Colors.WHITE}
									onSyncPress={() => this.handleSwitch(realm, device, favorite, hasAutoConnect, !hasAutoNotify)}
								/>
							</View>
						</View>						
						{device.services && device.services.map(s => {
							let chars = device.characteristics.filter(c => c.service === s.uuid);
							return(
							<ServiceBox 
								key={s.uuid} 
								uuid={s.uuid} 
								connected={connected}
								style={[serviceBox, {backgroundColor: connected ? Colors.BLUE : Colors.GREY }]}>
								{chars.map(c=>{
									let read = c.properties.hasOwnProperty('Read') && c.properties.Read === 'Read';
									let notify = c.properties.hasOwnProperty('Notify') && c.properties.Notify === 'Notify';
									let newestValue = Utils.convertRealmResultsToArray(realm.objects('Data')
										.filtered('characteristic == "' + c.characteristic +'"').slice(-1))[0];
									let valueCount = realm.objects('Data')
										.filtered('characteristic == "' + c.characteristic +'"').length;
									let notifying = notifyingChars.map(ch=>ch.characteristic).includes(c.characteristic);
									return (
										<CharBox
											key={c.characteristic}
											service={s.uuid}
											characteristic={c.characteristic}
											read={read}
											notify={notify}
											hasAutoNotify={hasAutoNotify}
											notifying={notifying}
											newestValue={newestValue}
											valueCount={valueCount}
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
		marginHorizontal: 25,
		width: 120,
		height: 40,
		borderRadius: 5,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: Colors.GREEN,
	},
	offButton: {
		marginHorizontal: 25,
		width: 120,
		height: 40,
		borderRadius: 5,
		justifyContent: 'center',
		alignItems: 'center',		
		backgroundColor: Colors.PURPLE,
	},	
	disabledButton: {
		marginHorizontal: 25,
		width: 120,
		height: 40,
		borderRadius: 5,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: Colors.GREY,
	},	
	buttonText: {
		color: Colors.WHITE,
		fontSize: 15,
	},
	deviceActionButtons: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'flex-end',
		marginTop: 8,
	},
	serviceBox: {
		width: Dimensions.get('window').width - 20,
		height: 60,
		borderWidth: 1,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 15,
		borderColor: Colors.BLUE,
		backgroundColor: Colors.BLUE,
	},
	charBox: {
		width: Dimensions.get('window').width - 20,
		minHeight: 30,
		borderWidth: 1,
		borderTopWidth: 0,
		justifyContent: 'center',
		alignItems: 'center',
		borderColor: Colors.BLUE,
		backgroundColor: Colors.WHITE,
	},
	text: {
		fontSize: 18,
		color: Colors.BLACK,
	},
	textSmall: {
		fontSize: 16,
		color: Colors.BLACK,
	},
	scrollView: {
		flex: 1,
		justifyContent: 'flex-end',
		alignItems: 'center',
	},
	switchContainer: {
		width: 100,
		alignItems: 'center',
	}
});

const { 
	container, 
	button,
	offButton,
	disabledButton,
	buttonText, 
	deviceActionButtons,
	text, 
	textSmall, 
	serviceBox,
	charBox,
	scrollView,
	switchContainer,
} = styles;

function mapStateToProps(state) {
  return {
    ble: state.ble
  };
}

function mapDispatchToProps(dispatch) {
  return {
    bleConnect: (BleManager, realm, device) => dispatch(bleConnect(BleManager, realm, device)),
    bleConnecting: (device) => dispatch(bleConnecting(device)),
    bleDisconnect: (BleManager, device) => dispatch(bleDisconnect(BleManager, device)),
    bleRead: (BleManager, realm, Utils, deviceID, service, characteristic) => 
    	dispatch(bleRead(BleManager, realm, Utils, deviceID, service, characteristic)),
    bleNotify: (BleManager, deviceID, charArray) => 
    	dispatch(bleNotify(BleManager, deviceID, charArray)),
    bleNotifyStop: (BleManager, deviceID, charArray) => 
    	dispatch(bleNotifyStop(BleManager, deviceID, charArray)),
    bleModifyDevice: (realm, device, favorite, autoConnect, autoNotify) => 
    	dispatch(bleModifyDevice(realm, device, favorite, autoConnect, autoNotify)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DeviceDetailView);