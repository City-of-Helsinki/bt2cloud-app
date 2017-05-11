import React from 'react';
import {
  AppRegistry,
  View,
} from 'react-native';

import { connect } from 'react-redux';
import { fetchData } from './actions/actions';

import ScrollableTabView from 'react-native-scrollable-tab-view';
import TabBar from './components/TabBar';

import ScanView from './views/ScanView';
import MyDevicesView from './views/MyDevicesView';

const App = (props) => {
  return (
    <ScrollableTabView renderTabBar={() => <TabBar someProp={'here'} />}>
      <ScanView tabLabel="Scan&Connect" />
      <MyDevicesView tabLabel="My Devices" />
      <ScanView tabLabel="Page 3" />
    </ScrollableTabView>
  );
}

function mapStateToProps(state) {
  return {
    appData: state.appData
  };
}

export default connect(mapStateToProps, null)(App);