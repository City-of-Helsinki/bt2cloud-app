import React, { Component } from 'react';
import {
	View,
	Text,
	TouchableHighlight,
	StyleSheet,
	Animated
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';

class DeviceBox extends Component {
	constructor(props){
		super(props);
		this.state={
			collapsed: false,
		}
		this.arrowPress = this.arrowPress.bind(this);
	}

	arrowPress(){
		this.setState({ collapsed: !this.state.collapsed });
	}

	render() {
		let arrowIcon = this.state.collapsed ? 'angle-up' : 'angle-down';
		return (
			<View>
			<TouchableHighlight 
				onPress={this.props.onPress} 
				style={this.props.style}>
				<View style={innerContainer}>
					<View style={iconContainer}>
					{this.props.connected && 
						<Icon name="check-circle" size={30} color="#FFF" />
					}
					</View>
					<View style={contentContainer}>
					<Text style={[text, {color: this.props.connected ? 'white' : 'navy'}]}>
						Name: {this.props.device.name}
					</Text>
					<Text style={[text, {color: this.props.connected ? 'white' : 'navy'}]}>
						ID: {this.props.device.id}
					</Text>
					</View>
					{this.props.connected && this.props.collapsable && 
						<TouchableHighlight onPress={this.arrowPress} style={iconContainer}>
						<Icon name={arrowIcon} size={30} color="#FFF" />
						</TouchableHighlight>
					}
				</View>
			</TouchableHighlight>	
			{this.props.connected && this.state.collapsed && 
				<Animated.View style={deviceDetailsContainer}>
				</Animated.View>
			}
			</View>
		);
	}
} 
	
export default DeviceBox;

const styles = StyleSheet.create({
	innerContainer: {
		flexDirection: 'row',
		justifyContent: 'space-around',
	},
	contentContainer: {
		flex: 1,
	},
	iconContainer: {
		width: 30,
		height: 30,
		marginHorizontal: 20,
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


