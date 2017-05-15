import React, { Component } from 'react';
import {
	View,
	Text,
	TouchableHighlight,
	StyleSheet,
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';

const CharBox = (props) => {
		return (
			<View style={props.style}>
				<View style={innerContainer}>
					<View style={contentContainer}>
					<Text style={text}>
						{props.characteristic}
					</Text>
					</View>
					{props.notify && 
						<TouchableHighlight onPress={props.notifyPress} 
							style={[iconContainer, {backgroundColor: connected ? 'navy' : '#444' }]}>
						<Text style={buttonText}>Notify</Text>
						</TouchableHighlight>
					}
					{props.read && 
					<TouchableHighlight onPress={props.readPress} 
						style={[iconContainer, {backgroundColor: connected ? 'navy' : '#444' }]}>
						<Text style={buttonText}>Read</Text>
					</TouchableHighlight>
					}
				</View>
			</View>	
		);
} 

const styles = StyleSheet.create({
	innerContainer: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		alignItems: 'center',
		padding: 4,
	},
	contentContainer: {
		flex: 1,
	},
	iconContainer: {
		width: 60,
		height: 36,
		alignItems: 'center',
		justifyContent: 'center',
		marginLeft: 5,
		backgroundColor: 'navy',
		borderRadius: 5,
	},
	deviceDetailsContainer: {
		width: 300,
		height: 300,
		borderWidth: 1,
	},
	text:{
		fontSize: 12,	
		color: 'navy',
	},
	buttonText:{
		fontSize: 14,	
		color: 'white',
	}
});
const { 
	text, 
	buttonText,
	innerContainer, 
	contentContainer, 
	iconContainer, 
	deviceDetailsContainer 
} = styles;

export default CharBox;