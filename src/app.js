import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { Scene, Router } from 'react-native-router-flux';

import { connect } from 'react-redux';

import MainView from './views/MainView';
import DeviceDetailView from './views/DeviceDetailView';
import SplashScreen from './views/SplashScreen';

import { getDeviceInfo } from './actions/actions';

class App extends Component {

	constructor(props) {
		super(props);
	}

	componentDidMount() {
		this.props.getDeviceInfo();
    navigator.geolocation.getCurrentPosition((position) => {
      var lastPosition = JSON.stringify(position);
      console.log(lastPosition);
    });
    this.watchID = navigator.geolocation.watchPosition((position) => {
      var lastPosition = JSON.stringify(position);
      console.log(lastPosition);
    });

	}

	componentWillUnmount() {
		if (this.watchID) navigator.geolocation.clearWatch(this.watchID);
	}

	render() {
		let { initializing } = this.props.settings;
		function renderSplashOrMain() {
			if (initializing) {
				return <SplashScreen />;
			}
			else {
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

		return (
			<View style={{flex: 1}}>
			{renderSplashOrMain()}
			</View>
		);
	}
}

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

function mapStateToProps(state) {
  return {
  	settings: state.settings,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    getDeviceInfo: () => dispatch(getDeviceInfo()),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);