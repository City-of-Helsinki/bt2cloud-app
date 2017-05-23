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
} from 'react-native';

import { connect } from 'react-redux';
import realm from '../realm';
import Utils from '../utils/utils';

import {
	settingsChangeFlushToDisk,
	settingsChangeGPSInterval,
} from '../actions/actions';

class SettingsView extends Component {

	constructor(props) {
		super(props);
		this.saveDiskIntervalToDB = this.saveDiskIntervalToDB.bind(this);
		this.saveGPSIntervalToDB = this.saveGPSIntervalToDB.bind(this);
	}

	saveDiskIntervalToDB(value) {

	}
	
	saveGPSIntervalToDB(value) {
		
	}

	render() {
		let { deviceInfo, flushToDiskInterval, GPSInterval } = this.props.settings;

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
						/>
						<Text style={sliderText}>Record GPS location every {GPSInterval} seconds</Text>
						<Slider 
							minimumValue={10}
							maximumValue={600}
							value={GPSInterval}
							style={slider}
							step={10}
							onValueChange={(value)=>this.props.settingsChangeGPSInterval(value)}
						/>
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
		width: 110,
		height: 40,
		borderRadius: 5,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'navy',
		alignSelf: 'center',
	},
	buttonText: {
		color: 'white',
		fontSize: 20,
	},
	text: {
		fontSize: 18,
		color: 'black',
		textAlign: 'center',
	},
	textSmall: {
		fontSize: 16,
		color: 'black',
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