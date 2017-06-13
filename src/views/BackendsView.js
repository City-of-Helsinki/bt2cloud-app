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
import moment from 'moment';
import generateUuid from 'react-native-uuid';
import { connect } from 'react-redux';
import realm from '../realm';
import store from '../store';
import Utils from '../utils/utils';
import Colors from '../colors';
import BackendBox from '../components/BackendBox';

import FloatingActionButton from '../components/FloatingActionButton';

import { SETTINGS_REFRESH, FILESYSTEM_UPLOADING, FILESYSTEM_UPLOADING_DONE } from '../constants';

const Form = t.form.Form;

const Protocol = t.enums({
	http: 'http://',
	https: 'https://',
}, 'Protocol');

const BasicAuth = t.struct({
	username: t.maybe(t.String),
	password: t.maybe(t.String),
});

// To validate the form, Basic Auth needs to have both the username and password set, or neither of them.
// If only one is set, the validation fails.
const BothNeeded = t.refinement(BasicAuth, function(b) {
	return b.username != null && b.password != null || b.username == null && b.password == null;
});

const Backend = t.struct({
	name: t.String,
	protocol: Protocol,
	url: t.String,
	basicAuth: BothNeeded,
});

const options = {
	fields: {
		name: {
			help: 'e.g. My Backend',
			error: 'Please enter a name',
		},
		protocol: {
			placeholder: 'Protocol',
			help: 'e.g. https://',
		},
		url: {
			label: 'URL',
			help: 'e.g. api.mysite.com/endpoint/',
			error: 'Please enter a URL',
		},
		basicAuth: {
			error: 'Provide both user&pass or neither!',
			help: 'Optional. Set both or neither.',
			username: {
				label: 'Username',
			},
			password: {
				label: 'Password',
			},	
		},	
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
		this.handleSendPress = this.handleSendPress.bind(this);
		this.sendFile = this.sendFile.bind(this);		
		this.state = {
			editView: false,
			editedBackend: null,
			formValue: {
				protocol: 'https',
			},
			backends: Utils.convertRealmResultsToArray(realm.objects('Backend')) || [],
		}
	}

	handleFloatingButtonPress() {
		this.setState({
			editView: true,
			editedBackend: null,
		});
	}

	handleCancelPress() {
		this.setState({
			editView: false,
		});
	}

	handleSavePress() {
		let formInput = this.refs.backendForm.getValue();
		let uuid = this.state.editedBackend ? this.state.editedBackend : generateUuid.v4();
		console.log(uuid, typeof uuid);
		console.log(formInput);
		if (formInput) {
			this.setState({formValue: {protocol: 'https'}, editView: false});
			let { name, protocol, url, basicAuth } = formInput;
			realm.write(()=>{
				let backend = realm.create('Backend', {
					id: uuid,	
					name,
					protocol,
					url,
					username: basicAuth.username,
					password: basicAuth.password,
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
		let that = this;
		realm.write(()=>{
			let backend = realm.objects('Backend').filtered('id == $0', backendObject.id)[0];
			let settings = realm.objects('Settings').filtered('name == $0', 'settings')[0];

			if (settings.activeBackend && settings.activeBackend.id === backend.id) {
				console.log('Marking active backend as null');
				realm.create('Settings', {
					name: 'settings',
					activeBackend: null,
				}, true);		
				that.props.refreshSettings();
			}

			realm.delete(backend);
			that.setState({backends: Utils.convertRealmResultsToArray(realm.objects('Backend'))});
		});			
	}

	handleEditPress(backendObject){
			this.setState({
				editView: true,
				editedBackend: backendObject.id,
				formValue: {
					name: backendObject.name,
					protocol: backendObject.protocol,
					url: backendObject.url,
					basicAuth: {
						username: backendObject.username,
						password: backendObject.password,
					},
				},
			})
	}

	handleSetActivePress(backendObject){
		realm.write(()=>{
			let backend = realm.objects('Backend').filtered('id == $0', backendObject.id)[0];
			realm.create('Settings', {
				name: 'settings',
				activeBackend: backend,
			}, true);
		});
		this.props.refreshSettings();
	}

	sendFile(filenames, totalFiles, remainingFiles, datestring, errors=[]) {
		console.log('sendFile');
		if (filenames.length < 1) return;
		let { activeBackend } = this.props.settings;
		let protocol = activeBackend.protocol;
		let url = activeBackend.url;
		url = url.replace(/(^\w+:|^)\/\//, ''); // remove protocols if user entered them		
		let request = {
			type: 'POST',
			url: protocol + '://' + url,
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'multipart/form-data',
				'User-Agent': 'Bt2Cloud/v0.1/' + datestring, 
			},
			filename: filenames[0],
			metadata: {
				phoneId: this.props.settings.deviceInfo.id,
			},
		};

		if (activeBackend.username && activeBackend.password) {
			request.headers['Authorization'] = 
				'Basic ' + Utils.btoa(activeBackend.username + ':' + activeBackend.password);
		}

		console.log(request.headers['Authorization']);

		this.props.uploading();
		Utils.httpRequest(request)
			.then((res)=> {
				console.log(res.status);
				Utils.moveToSentFolder(filenames[0])
					.then(()=> {
						console.log('moved');
						filenames.splice(0,1);
						remainingFiles -= 1;
						if (filenames.length>0) this.sendFile(filenames, totalFiles, remainingFiles, datestring, errors);
						else {
							this.props.uploadingDone();
							this.showUploadResultAlert(errors, totalFiles, remainingFiles);
						}
					})
					.catch((err)=> {
						console.log(err);
					});
			})
			.catch((err)=> {
				console.log('Error sending to backend: ' + err);
				filenames.splice(0,1);
				errors.push(err);
				if (filenames.length>0) this.sendFile(filenames, totalFiles, remainingFiles, datestring, errors);
				else {
					this.props.uploadingDone();
					this.showUploadResultAlert(errors, totalFiles, remainingFiles);
				}
			});
	}

	showUploadResultAlert(errors, totalFiles, remainingFiles) {
		let alertTitle, alertMessage;
		if (errors.length === 0) alertTitle = 'Upload success';
		if (errors.length > 0 && errors.length < totalFiles) alertTitle = 'Upload partial success';
		if (errors.length === totalFiles) alertTitle = 'Upload failed';

		alertMessage = 'Successfully sent ' + (totalFiles-remainingFiles) + '/' + totalFiles + ' zip files \n';
		if (errors.length>0) alertMessage += 'Errors: \n';
		errors.forEach(e=> alertMessage += e + '\n');
		Alert.alert(alertTitle, alertMessage);
	}

	handleSendPress() {
		Utils.createZip(store)
			.then((data)=> {
				console.log('Successfully created zip at ' + data.path);
				Utils.deleteUnsentFolder();
					Utils.getUnsentZips()
						.then((filenames)=>{
							console.log('filenames length' + filenames.length);
							let datestring = moment(new Date()).format('YYYY-MM-DD');
							files = filenames.slice();
							this.sendFile(files, files.length, files.length, datestring);
						});											
			})
			.catch((err)=> {
				Alert.alert('Error', err);
			});
	}

	render() {
		let that = this;
		function renderBackends(backends) {
			if (backends && backends.length > 0) {
			return backends.map(b=> {
				let active = !that.props.settings.activeBackend ? false 
					: that.props.settings.activeBackend.id === b.id;
				return (
					<BackendBox 
						key={b.name}
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
		console.log('uploading: ' + this.props.isUploading);
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
					<TouchableHighlight 
						style={this.props.isUploading || !this.props.settings.activeBackend ? 
							[largeButton, disabled] : largeButton} 
						onPress={this.props.isUploading || !this.props.settings.activeBackend ? 
							()=>null : this.handleSendPress}>
						<Text style={buttonTextSmaller}>
							{this.props.isUploading ? 'Sending...' : 'Send BLE/GPS data to backend'}
						</Text>
					</TouchableHighlight>					
				</View>
				}
				{!editView &&
					<FloatingActionButton 
						displayText="+" 
						color={Colors.GREEN} 
						fontSize={40}
						size={60} 
						onPress={this.handleFloatingButtonPress}
					/>	
				}			
			</View>
		);
	}
	
}

styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'stretch',
		justifyContent: 'flex-end',
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
	largeButton: {
		marginTop: 20,
		width: 200,
		height: 60,
		borderRadius: 5,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: Colors.BLUE,
		alignSelf: 'center',
	},	
	disabled: {
		backgroundColor: Colors.GREY,
	},
	buttonText: {
		color: 'white',
		fontSize: 20,
		textAlign: 'center',
	},
	buttonTextSmaller: {
		color: 'white',
		fontSize: 15,
		textAlign: 'center',
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
	largeButton,
	buttonText, 
	buttonTextSmaller,
	text, 
	textSmall,
	scrollView,
	formButtons,
	backendBox,
	activeBackendBox,
	disabled,
} = styles;

function mapStateToProps(state) {
  return {
  	settings: state.settings,
  	isUploading: state.filesystem.uploading,
  };
}

function mapDispatchToProps(dispatch) {
  return {
  	refreshSettings: () => dispatch({type: SETTINGS_REFRESH}),
  	uploading: () => dispatch({type: FILESYSTEM_UPLOADING}),
  	uploadingDone: () => dispatch({type: FILESYSTEM_UPLOADING_DONE}),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(BackendsView);