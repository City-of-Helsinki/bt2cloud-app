import React, { Component } from 'react';

import ScrollableTabView from 'react-native-scrollable-tab-view';
import TabBar from '../components/TabBar';

import ScanView from './ScanView';

class MainView extends Component {
	render() {
	  return (
	    <ScrollableTabView renderTabBar={() => <TabBar someProp={'here'} />}>
	      <ScanView tabLabel="Nearby devices" />
	      <ScanView tabLabel="History(foo)" />
	      <ScanView tabLabel="Settings(foo)" />
	    </ScrollableTabView>
	  );
	}
}

export default MainView;