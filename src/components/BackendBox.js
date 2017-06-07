import React, { Component } from 'react';
import {
	View,
	Text,
	TouchableHighlight,
	StyleSheet,
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';
import Colors from '../colors';

const BackendBox = (props) => {
	return (
		<View>
		<TouchableHighlight onPress={()=>props.setActivePress(props.backend)} style={props.style}>
			<View style={innerContainer}>
				<TouchableHighlight onPress={()=>props.editPress(props.backend)} style={iconContainer}>
					<Icon name="info" size={30} color={props.active ? Colors.WHITE : Colors.BLUE} />
				</TouchableHighlight>
				<View style={contentContainer}>
				<Text style={[text, {color: props.active ? Colors.WHITE : Colors.BLUE}]}>
					{props.backend.name}
				</Text>
				<Text style={[textSmall, {color: props.active ? Colors.WHITE : Colors.BLUE}]}>
					{props.backend.url}
				</Text>
				</View>
					<TouchableHighlight onPress={()=>props.removePress(props.backend)} style={iconContainer}>
					<Icon name='remove' size={40} color={props.active ? Colors.WHITE : Colors.BLUE} />
					</TouchableHighlight>
			</View>
		</TouchableHighlight>
		</View>	
	);
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

export default BackendBox;

