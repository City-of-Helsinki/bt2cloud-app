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

import ServiceBox from '../components/ServiceBox';
import CharBox from '../components/CharBox';

class DeviceDetailView extends Component {

	constructor(props) {
		super(props);
		this.readPress = this.readPress.bind(this);
		this.notifyPress = this.notifyPress.bind(this);
	}

	componentDidMount() {
	}

	readPress() {
	}

	notifyPress() {
	}

	render() {
		let that = this;
		let { started, startError, scanning, scanError, peripherals, connectedPeripherals,
			peripheralsWithServices, connectError } = this.props.ble;
		let { device } = this.props;
		console.log(device.services);


		return (
			<View style={container}>
				<ScrollView>
					<View style={scrollView}>
						{device.services.map(s => {
							let chars = device.characteristics.filter(c => c.service === s.uuid);
							console.log('chars: ', chars);
							return(
							<ServiceBox key={s.uuid} uuid={s.uuid} style={serviceBox}>
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
											readPress={this.readPress}
											notifyPress={this.notifyPress}
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
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DeviceDetailView);