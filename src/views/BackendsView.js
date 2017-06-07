import React, { Component } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableHighlight,
	ScrollView,
	ActivityIndicator,
	Dimensions,
	Alert,
} from 'react-native';

import t from 'tcomb-form-native';
import { connect } from 'react-redux';
import realm from '../realm';
import Utils from '../utils/utils';
import Colors from '../colors';
import BackendBox from '../components/BackendBox';

import FloatingActionButton from '../components/FloatingActionButton';

import { SETTINGS_REFRESH } from '../constants';

const Form = t.form.Form;

const Protocol = t.enums({
	http: 'http://',
	https: 'https://',
}, 'Protocol');

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
		this.handleSavePress = this.handleSavePress.bind(this);
		this.handleRemovePress = this.handleRemovePress.bind(this);
		this.handleEditPress = this.handleEditPress.bind(this);
		this.handleSetActivePress = this.handleSetActivePress.bind(this);
		this.onChange = this.onChange.bind(this);
		this.state = {
			editView: false,
			formValue: {
				protocol: 'https',
			},
			backends: Utils.convertRealmResultsToArray(realm.objects('Backend')) || [],
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

	handleSavePress() {
		let formInput = this.refs.backendForm.getValue();
		console.log(formInput);
		if (formInput) {
			this.setState({formValue: {protocol: 'https'}, editView: false});
			let { name, protocol, url } = formInput;
			realm.write(()=>{
				let backend = realm.create('Backend', {
					name,
					protocol,
					url,
				}, true);
			});
			this.setState({backends: Utils.convertRealmResultsToArray(realm.objects('Backend'))});
		}
	}

	onChange(formValue){
		this.setState({formValue});
	}

	handleRemovePress(backendObject){
    Alert.alert(
      'Remove backend',
      'Are you sure?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'OK', onPress: this.handleConfirmRemove.bind(this, backendObject)}
      ],
      {cancelable:false}
    );

	}

	handleConfirmRemove(backendObject){
		realm.write(()=>{
			let backend = realm.objects('Backend').filtered('name == $0', backendObject.name)[0];
			realm.delete(backend);
		});
		this.props.refreshSettings();				
	}

	handleEditPress(){

	}

	handleSetActivePress(backendObject){
		realm.write(()=>{
			let backend = realm.objects('Backend').filtered('name == $0', backendObject.name)[0];
			realm.create('Settings', {
				name: 'settings',
				activeBackend: backend,
			}, true);
		});
		this.props.refreshSettings();
	}

	render() {
		let that = this;
		function renderBackends(backends) {
			if (backends && backends.length > 0) {
			return backends.map(b=> {
				let active = !that.props.settings.activeBackend ? false 
					: that.props.settings.activeBackend.name === b.name;
				return (
					<BackendBox 
						backend={b} 
						active={active}
						style={active ? activeBackendBox : backendBox} 
						removePress={that.handleRemovePress}
						editPress={that.handleEditPress}
						setActivePress={(that.handleSetActivePress)}
					/>
				);
			});
			}
			else return <Text>No backends set. Press the + button to add a backend.</Text>;
		}		

		let { editView, backends } = this.state;
		console.log('editview is ' + editView);
		console.log(this.props.settings);
		return (
			<View style={container}>
				{editView && <ScrollView>
					<View style={scrollView}>
						<Form
							ref='backendForm'
							type={Backend}
							value={this.state.formValue}
							options={options}
							onChange={this.onChange}
						/>
						<View style={formButtons}>
							<TouchableHighlight onPress={this.handleSavePress} style={button}>
								<Text style={buttonText}>Save</Text>
							</TouchableHighlight>	
							<TouchableHighlight onPress={this.handleCancelPress} style={button}>
								<Text style={buttonText}>Cancel</Text>
							</TouchableHighlight>	
						</View>
					</View>
				</ScrollView>
				}
				{!editView && 
				<View style={{flex:1}}>
					<ScrollView>
						<View style={scrollView}>
						<Text style={text}>Active backend is marked blue.</Text>
						{renderBackends(backends)}
						</View>
					</ScrollView>
					<FloatingActionButton 
						displayText="+" 
						color={Colors.GREEN} 
						size={40} 
						onPress={this.handleFloatingButtonPress}
					/>
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
		backgroundColor: Colors.BLUE,
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
	backendBox: {
		width: Dimensions.get('window').width - 40,
		height: 60,
		borderWidth: 1,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 15,
		borderColor: Colors.BLUE,
		backgroundColor: Colors.WHITE,
	},	
	activeBackendBox: {
		width: Dimensions.get('window').width - 40,
		height: 60,
		borderWidth: 1,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 15,
		borderColor: Colors.BLUE,
		backgroundColor: Colors.BLUE,
	},		
});

const { 
	container, 
	button,
	buttonText, 
	text, 
	textSmall,
	scrollView,
	formButtons,
	backendBox,
	activeBackendBox,
} = styles;

function mapStateToProps(state) {
  return {
  	settings: state.settings,
  };
}

function mapDispatchToProps(dispatch) {
  return {
  	refreshSettings: () => dispatch({type: SETTINGS_REFRESH}),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(BackendsView);