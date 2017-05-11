import React, { Component } from 'react';
import {
	View,
	Text,
	TouchableHighlight,
	StyleSheet,
} from 'react-native';

class DeviceBox extends Component {
	constructor(props){
		super(props);
	}

	render() {
		return (
			<TouchableHighlight 
				onPress={this.props.onPress} 
				style={this.props.style}>
				<View>
					<Text style={[text, {color: this.props.connected ? 'white' : 'navy'}]}>
						Name: {this.props.device.name}
					</Text>
					<Text style={[text, {color: this.props.connected ? 'white' : 'navy'}]}>
						ID: {this.props.device.id}
					</Text>
				</View>
			</TouchableHighlight>	
		);
	}
} 
	
export default DeviceBox;

const styles = StyleSheet.create({
	text:{
		fontSize: 14,	
	}
});
const { text } = styles;


