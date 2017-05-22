import React, { Component } from 'react';

import ScrollableTabView from 'react-native-scrollable-tab-view';
import TabBar from '../components/TabBar';

import ScanView from './ScanView';
import BackendsView from './BackendsView';

class MainView extends Component {
	render() {
	  return (
	    <ScrollableTabView renderTabBar={() => <TabBar someProp={'here'} />}>
	      <ScanView tabLabel="Nearby devices" />
	      <BackendsView tabLabel="Backends" />
	      <ScanView tabLabel="App Settings" />
	    </ScrollableTabView>
	  );
	}
}

export default MainView;