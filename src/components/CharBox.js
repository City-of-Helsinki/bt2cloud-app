import React, { Component } from 'react';
import {
	View,
	Text,
	TouchableHighlight,
	StyleSheet,
} from 'react-native';

import moment from 'moment';
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
						<TouchableHighlight onPress={() => props.notifyPress(props.service, props.characteristic)} 
							style={[iconContainer, {backgroundColor: props.connected ? 'navy' : '#444' }]}>
						<Text style={buttonText}>{props.notifying ? 'Stop' : 'Notify'}</Text>
						</TouchableHighlight>
					}
					{props.read && 
					<TouchableHighlight 
						onPress={() => props.readPress(props.service, props.characteristic)} 
						style={[iconContainer, {backgroundColor: props.connected ? 'navy' : '#444' }]}>
						<Text style={buttonText}>Read</Text>
					</TouchableHighlight>
					}
				</View>
				{props.newestValue && 
					<View style={innerContainer}>
						<View style={contentContainer}>
							<Text style={text}>
								Value: {props.newestValue.ascii}
							</Text>
							<Text style={text}>
								Hex: {props.newestValue.hex}
							</Text>
							<Text style={text}>
								Time: {moment(props.newestValue.time).format()}
							</Text>
							<Text style={text}>
								No. of objects: {props.valueCount}
							</Text>							
						</View>				
					</View>
				}

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