import React, { Component } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import TabBar from '../components/TabBar';

import { connect } from 'react-redux';
import BGTimer from 'react-native-background-timer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import realm from '../realm';
import ScanView from './ScanView';
import BackendsView from './BackendsView';
import SettingsView from './SettingsView';
import store from '../store';
import Utils from '../utils/utils';
import Colors from '../colors';

import {
	FILE_TAG_GPS,
	GPS_OPTIONS,
} from '../constants';

class MainView extends Component {

	constructor(props) {
		super(props);
	}

	componentWillReceiveProps(newProps) {
		if (!newProps.settings || !newProps.settings.GPSInterval) return;
		
		if (newProps.settings.GPSInterval !== this.props.settings.GPSInterval) {
			if (GPSTrigger) BGTimer.clearInterval(GPSTrigger);
			setGPSTrigger(newProps.settings.GPSInterval);
		}
	}

	render() {
		console.log('mainView render');
	  return (
	  	<View style={{flex: 1}}>
		    <ScrollableTabView renderTabBar={() => <TabBar />}>
		      <ScanView tabLabel="Nearby devices" />
		      <BackendsView tabLabel="Backends" />
		      <SettingsView tabLabel="App Settings" />
		    </ScrollableTabView>
		    {this.props.recording && <View style={styles.recIcon}>
		    	<Icon name="record-rec" size={60} color="#F00" />
		    </View>}
	    </View>
	  );
	}
}

function mapStateToProps(state) {
  return {
  	settings: state.settings,
  	recording: state.ble.notifyingChars.length > 0,
  };
}

function mapDispatchToProps(dispatch) {
  return {
  };
}

const styles = StyleSheet.create({
	recIcon: {
		zIndex: 999,
		position: 'absolute',
		bottom: 20,
		left: 0,
		width: 60,
		height: 60,
		justifyContent: 'center',
		alignItems: 'center',
	}
});

export default connect(mapStateToProps, mapDispatchToProps)(MainView);