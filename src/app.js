import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import { Scene, Router } from 'react-native-router-flux';

import MainView from './views/MainView';
import DeviceDetailView from './views/DeviceDetailView';

class App extends Component {
	render() {
		return (
			<Router>
				<Scene key="root" titleStyle={navBarTitle} navigationBarStyle={navBar}>
					<Scene key="MainView" component={MainView} title="BT2CLOUD" />
					<Scene key="DeviceDetailView" component={DeviceDetailView} title="BT2CLOUD" />
				</Scene>
			</Router>
		);
	}
}

export default App;

const styles = StyleSheet.create({
	navBar: {
		backgroundColor: 'navy',
		height: 60,
	},
	navBarTitle: {
		color: 'white',
		fontSize: 20,
	}
});

const {
	navBar,
	navBarTitle,
} = styles;