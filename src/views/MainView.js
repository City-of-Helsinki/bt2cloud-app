import React, { Component } from 'react';

import ScrollableTabView from 'react-native-scrollable-tab-view';
import TabBar from '../components/TabBar';

import { connect } from 'react-redux';
import BGTimer from 'react-native-background-timer';

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
	    <ScrollableTabView renderTabBar={() => <TabBar />}>
	      <ScanView tabLabel="Nearby devices" />
	      <BackendsView tabLabel="Backends" />
	      <SettingsView tabLabel="App Settings" />
	    </ScrollableTabView>
	  );
	}
}

function mapStateToProps(state) {
  return {
  	settings: state.settings,
  };
}

function mapDispatchToProps(dispatch) {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MainView);