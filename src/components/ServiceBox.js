import React, { Component } from 'react';
import {
	View,
	Text,
	TouchableHighlight,
	StyleSheet,
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';
import { GATT_SERVICES } from '../constants';

class ServiceBox extends Component {
	constructor(props){
		super(props);

		this.state = {
			collapsed: false,
		}
		this.infoPress = this.infoPress.bind(this);
	}

	infoPress(){
		this.setState({collapsed: !this.state.collapsed})
	}

	render() {
		const findStandardizedService = GATT_SERVICES.filter(s => s.uuid === this.props.uuid.toUpperCase());
		let standardizedService = null;
		if (findStandardizedService) standardizedService = findStandardizedService[0];
		let arrowIcon = this.state.collapsed ? 'angle-up' : 'angle-down';
		return (
			<View>
			<View style={this.props.style}>
				<View style={innerContainer}>
					<View style={iconContainer}>
						<Icon name="usd" size={30} color="#FFF" />
					</View>
					<View style={contentContainer}>
					<Text style={text}>
						{standardizedService ? 'SERVICE TYPE:' : 'CUSTOM SERVICE, ID:'}
					</Text>
					<Text style={textSmall}>
						{standardizedService ? standardizedService.description : this.props.uuid}
					</Text>
					</View>
						<TouchableHighlight onPress={this.infoPress} style={iconContainer}>
						<Icon name={arrowIcon} size={30} color="#FFF" />
						</TouchableHighlight>
				</View>
			</View>
			{this.state.collapsed && this.props.children}
			</View>	
		);
	}
} 

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
		width: 60,
		height: 60,
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
		color: 'white',
	},
	textSmall:{
		fontSize: 12,	
		color: 'white',
	}	
});
const { text, textSmall, innerContainer, contentContainer, iconContainer, deviceDetailsContainer } = styles;

export default ServiceBox;

