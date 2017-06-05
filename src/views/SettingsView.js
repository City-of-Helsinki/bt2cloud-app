import React, { Component } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableHighlight,
	ScrollView,
	ActivityIndicator,
	Slider,
	Dimensions,
	Alert,
} from 'react-native';

import { connect } from 'react-redux';
import realm from '../realm';
import Utils from '../utils/utils';
import Colors from '../colors';

import {
	settingsChangeFlushToDisk,
	settingsChangeGPSInterval,
} from '../actions/actions';

class SettingsView extends Component {

	constructor(props) {
		super(props);
		this.saveDiskIntervalToDB = this.saveDiskIntervalToDB.bind(this);
		this.saveGPSIntervalToDB = this.saveGPSIntervalToDB.bind(this);
		this.sendToBackend = this.sendToBackend.bind(this);
	}

	saveDiskIntervalToDB(value) {
		realm.write(()=>{
			realm.create('Settings', {
				name: 'settings',
				flushToDiskInterval: value,
			}, true);
		});

	}
	
	saveGPSIntervalToDB(value) {
		realm.write(()=>{
			realm.create('Settings', {
				name: 'settings',
				saveGPSInterval: value,
			}, true);
		});
	}

	sendToBackend() {
		Utils.createZip()
			.then((path)=> {
				console.log('Successfully created zip at ' + path);
			})
			.catch((err)=> {
				console.log('Error creating zip: ' + err.message);
			});
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
						<Text style={sliderText}>Save char data to disk every {flushToDiskInterval} reads</Text>
						<Slider 
							minimumValue={1}
							maximumValue={100}
							value={flushToDiskInterval}
							style={slider}
							step={1}
							onValueChange={(value)=>this.props.settingsChangeFlushToDisk(value)}
							onSlidingComplete={(value)=>this.saveDiskIntervalToDB(value)}
						/>
						<Text style={sliderText}>Record GPS location every {GPSInterval} seconds</Text>
						<Slider 
							minimumValue={10}
							maximumValue={600}
							value={GPSInterval}
							style={slider}
							step={10}
							onValueChange={(value)=>this.props.settingsChangeGPSInterval(value)}
							onSlidingComplete={(value)=>this.saveGPSIntervalToDB(value)}
						/>

						<TouchableHighlight style={button} onPress={this.sendToBackend}>
							<Text style={buttonText}>Send to backend</Text>
						</TouchableHighlight>
					</View>
				</ScrollView>
			</View>
		);
	}
	
}

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
		alignItems: 'stretch',
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