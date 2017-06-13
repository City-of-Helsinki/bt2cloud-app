import React, { Component } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableHighlight,
	ScrollView,
	ActivityIndicator,
	TextInput,
	Dimensions,
	Alert,
} from 'react-native';

import { connect } from 'react-redux';
import Switch from 'react-native-switch-pro';
import realm from '../realm';
import configureBackgroundMode from '../configureBackgroundMode';
import Utils from '../utils/utils';
import Colors from '../colors';

import moment from 'moment';

import {
	settingsChangeFlushToDisk,
	settingsChangeGPSInterval,
} from '../actions/actions';

class SettingsView extends Component {

	constructor(props) {
		super(props);
		this.saveDiskIntervalToDB = this.saveDiskIntervalToDB.bind(this);
		this.saveGPSIntervalToDB = this.saveGPSIntervalToDB.bind(this);
		this.setBGMode = this.setBGMode.bind(this);
		this.state={
			gpsInputValue: props.settings.GPSInterval.toString(),
		};
	}

	saveDiskIntervalToDB(value) {
		realm.write(()=>{
			realm.create('Settings', {
				name: 'settings',
				flushToDiskInterval: value,
			}, true);
		});
	}
	
	saveGPSIntervalToDB() {
		console.log(this.state.gpsInputValue);
		let value = parseInt(this.state.gpsInputValue, 10);
		if (value < 1) value = 1;
		if (value > 3600) value = 3600;
		realm.write(()=>{
			realm.create('Settings', {
				name: 'settings',
				saveGPSInterval: value,
			}, true);
		});
		this.setState({gpsInputValue: value});
		this.props.settingsChangeGPSInterval(value);
	}

	setBGMode() {
		this.props.settings.backgroundMode ? configureBackgroundMode.disable() : configureBackgroundMode.enable();
	}

	render() {
		let { deviceInfo, flushToDiskInterval, GPSInterval, activeBackend } = this.props.settings;

		return (
			<View style={container}>
				<ScrollView>
					<View style={scrollView}>
						<Text style={text}>Device ID: {deviceInfo.id}</Text>
						<Text style={text}>Model: {deviceInfo.model}</Text>
						<Text style={text}>OS: {deviceInfo.os}</Text>
						<Text style={sliderText}>GPS location logging interval (seconds):</Text>
						<TextInput
							ref={(ref)=> {this.textInput = ref;}}
							maxLength={4}
							defaultValue={this.props.settings.GPSInterval.toString()}
							keyboardType='numeric'
							onChangeText={(v)=>this.setState({gpsInputValue: v})}
							onEndEditing={()=>this.saveGPSIntervalToDB()}
							returnKeyType='done'
							selectTextOnFocus={true}
							style={textInput}
							underlineColorAndroid='transparent'
						/>
						<Text style={sliderText}>Background mode (can read BLE even when app is killed):</Text>
						<Switch 
							height={40}
							width={80}		
							value={this.props.settings.backgroundMode}
							backgroundActive={Colors.GREEN}
							backgroundInactive={Colors.GRAY}
							circleColor={Colors.WHITE}
							onSyncPress={this.setBGMode}
						/>						
					</View>
				</ScrollView>
			</View>
		);
	}
	
}

/*<Text style={sliderText}>Save char data to disk every {flushToDiskInterval} reads</Text>
<Slider 
	minimumValue={1}
	maximumValue={100}
	value={flushToDiskInterval}
	style={slider}
	step={1}
	onValueChange={(value)=>this.props.settingsChangeFlushToDisk(value)}
	onSlidingComplete={(value)=>this.saveDiskIntervalToDB(value)}
/>*/

styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'stretch',
		justifyContent: 'flex-start',
		paddingBottom: 20,
		paddingHorizontal: 20,
		marginTop: 20,
	},
	button: {
		marginTop: 20,
		width: 150,
		height: 50,
		borderRadius: 5,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: Colors.BLUE,
		alignSelf: 'center',
	},
	buttonText: {
		color: Colors.WHITE,
		fontSize: 16,
	},
	text: {
		fontSize: 18,
		color: Colors.BLACK,
		textAlign: 'center',
	},	
	textSmall: {
		fontSize: 16,
		color: Colors.BLACK,
	},
	scrollView: {
		flex: 1,
		justifyContent: 'flex-end',
		alignItems: 'center',
		alignSelf: 'center',
	},
	formButtons: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	slider: {
		width: Dimensions.get('window').width - 40,
		marginLeft: 10,
	},
	sliderText: {
		fontSize: 14,
		fontWeight: '800',
		textAlign: 'center',
		marginTop: 40,
	},
	textInput: {
		marginTop: 20,
		fontSize: 20,
		width: 60,
		borderWidth: 1,
		textAlign: 'center',
	}
});

const { 
	container, 
	button,
	buttonText, 
	text, 
	textSmall,
	scrollView,
	formButtons,
	slider,
	sliderText,
	textInput
} = styles;

function mapStateToProps(state) {
  return {
    settings: state.settings,
  };
}

function mapDispatchToProps(dispatch) {
  return {
  	settingsChangeFlushToDisk: (value) => dispatch(settingsChangeFlushToDisk(value)),
  	settingsChangeGPSInterval: (value) => dispatch(settingsChangeGPSInterval(value)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingsView);