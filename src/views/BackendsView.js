import React, { Component } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableHighlight,
	ScrollView,
	ActivityIndicator,
} from 'react-native';

import t from 'tcomb-form-native';
import { connect } from 'react-redux';
import realm from '../realm';
import Utils from '../utils/utils';

import FloatingActionButton from '../components/FloatingActionButton';

const Form = t.form.Form;

const Protocol = t.enums({
	http: 'http://',
	https: 'https://',
});

const Backend = t.struct({
	name: t.String,
	protocol: Protocol,
	url: t.String,
});

const options = {
	fields: {
		name: {
			help: 'e.g. My Backend',
		},
		protocol: {
			placeholder: 'Protocol',
			help: 'e.g. https://',
		},
		url: {
			label: 'URL',
			help: 'e.g. api.mysite.com/endpoint/'
		}
	},
};

class BackendsView extends Component {

	constructor(props) {
		super(props);
		this.handleFloatingButtonPress = this.handleFloatingButtonPress.bind(this);
		this.handleCancelPress = this.handleCancelPress.bind(this);
		this.state = {
			editView: false,
			formValue: {
				protocol: 'https',
			},
		}
	}

	handleFloatingButtonPress() {
		this.setState({
			editView: true,
		});
	}

	handleCancelPress() {
		this.setState({
			editView: false,
		});
	}

	render() {
		let { started, startError, scanning, scanError, peripherals, connectedPeripherals,
			knownPeripherals, connectError, readHistory, notifyingChars } = this.props.ble;

		return (
			<View style={container}>
				{this.state.editView && <ScrollView>
					<View style={scrollView}>
						<Form
							ref='backendForm'
							type={Backend}
							value={this.state.formValue}
							options={options}
						/>
						<View style={formButtons}>
							<TouchableHighlight onPress={() => console.log('pressed')} style={button}>
								<Text style={buttonText}>Save</Text>
							</TouchableHighlight>	
							<TouchableHighlight onPress={this.handleCancelPress} style={button}>
								<Text style={buttonText}>Cancel</Text>
							</TouchableHighlight>	
						</View>
					</View>
				</ScrollView>
				}
				{!this.state.editView && 
				<View style={{flex:1}}>
					<ScrollView>
						<View style={scrollView}>
							<Text style={text}>No backends set. Press 'Add New' to add a backend. Spoiler alert: adding a backend doesn't work yet.</Text>
						</View>
					</ScrollView>
					<FloatingActionButton onPress={this.handleFloatingButtonPress}/>
				</View>
				}
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
} = styles;

function mapStateToProps(state) {
  return {
    ble: state.ble
  };
}

function mapDispatchToProps(dispatch) {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(BackendsView);