import React, { Component } from 'react';

import ScrollableTabView from 'react-native-scrollable-tab-view';
import TabBar from '../components/TabBar';

import ScanView from './ScanView';
import BackendsView from './BackendsView';
import SettingsView from './SettingsView';

class MainView extends Component {
	render() {
	  return (
	    <ScrollableTabView renderTabBar={() => <TabBar />}>
	      <ScanView tabLabel="Nearby devices" />
	      <BackendsView tabLabel="Backends" />
	      <SettingsView tabLabel="App Settings" />
	    </ScrollableTabView>
	  );
	}
}

export default MainView;