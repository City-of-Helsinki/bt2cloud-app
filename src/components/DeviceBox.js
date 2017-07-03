import React, { Component } from 'react';
import {
	View,
	Text,
	TouchableHighlight,
	StyleSheet,
	ActivityIndicator,
	LayoutAnimation,
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';

class DeviceBox extends Component {
	constructor(props){
		super(props);
	}

	componentWillReceiveProps(nextProps) {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
	}

	render() {
		let disconnectIcon = 'remove';
		let starIcon = this.props.favorite ? 'star' : 'star-o';
		let starColor = this.props.favorite ? 'gold' : 'gold';

		let mainAreaPress = this.props.inRange ? this.props.mainAreaPress : () => console.log('not in range');
		return (
			<View>
			<TouchableHighlight 
				onPress={mainAreaPress} 
				style={this.props.style}>
				<View style={innerContainer}>
					<TouchableHighlight onPress={this.props.favPress} style={iconContainer}>
						<Icon name={starIcon} size={40} color={starColor} />
					</TouchableHighlight>
					<View style={contentContainer}>
					<Text style={[text, {color: this.props.connected ? 'white' : 'navy'}]}>
						Name: {this.props.device.name}
					</Text>
					<Text style={[text, {color: this.props.connected ? 'white' : 'navy'}]}>
						ID: {this.props.device.id}
					</Text>
					</View>
					{this.props.connected && 
						<TouchableHighlight onPress={this.props.disconnectPress} style={iconContainer}>
						<Icon name={disconnectIcon} size={50} color="#FFF" style={{marginTop:-4}}/>
						</TouchableHighlight>
					}
					{this.props.connecting && 
						<ActivityIndicator size={40} color='navy' style={spinner} />
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
	},
	spinner: {
		marginRight: 20,
	}
});
const { text, innerContainer, contentContainer, iconContainer, deviceDetailsContainer, spinner } = styles;


