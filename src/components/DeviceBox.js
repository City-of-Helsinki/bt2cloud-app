import React, { Component } from 'react';
import {
	View,
	Text,
	TouchableHighlight,
	StyleSheet,
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';

class DeviceBox extends Component {
	constructor(props){
		super(props);

	}

	infoPress(){
		this.setState({ collapsed: !this.state.collapsed });
	}

	render() {
		let infoIcon = 'info';
		let starIcon = this.props.favorite ? 'star' : 'star-o';
		return (
			<View>
			<TouchableHighlight 
				onPress={this.props.onPress} 
				style={this.props.style}>
				<View style={innerContainer}>
					<View style={iconContainer}>
						<Icon name={starIcon} size={40} color="#000" />
					</View>
					<View style={contentContainer}>
					<Text style={[text, {color: this.props.connected ? 'white' : 'navy'}]}>
						Name: {this.props.device.name}
					</Text>
					<Text style={[text, {color: this.props.connected ? 'white' : 'navy'}]}>
						ID: {this.props.device.id}
					</Text>
					</View>
					{this.props.connected && 
						<TouchableHighlight onPress={this.props.infoPress} style={iconContainer}>
						<Icon name={infoIcon} size={30} color="#FFF" />
						</TouchableHighlight>
					}
				</View>
			</TouchableHighlight>	

			</View>
		);
	}
} 
	
export default DeviceBox;

const styles = StyleSheet.create({
	innerContainer: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
	},
	contentContainer: {
		flex: 1,
	},
	iconContainer: {
		width: 50,
		height: 50,
		alignItems: 'center',
		justifyContent: 'center',
		marginHorizontal: 10,
	},
	deviceDetailsContainer: {
		width: 300,
		height: 300,
		borderWidth: 1,
	},
	text:{
		fontSize: 14,	
	}
});
const { text, innerContainer, contentContainer, iconContainer, deviceDetailsContainer } = styles;


