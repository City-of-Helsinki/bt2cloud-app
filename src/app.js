import React from 'react';
import {
  AppRegistry,
  View,
} from 'react-native';

import { connect } from 'react-redux';
import { fetchData } from './actions/actions';
import { Scene, Router } from 'react-native-router-flux';

import Start from './views/start'

const App = (props) => {
  return (
    <Router>
      <Scene key="root" hideNavBar={true} duration={1}>
        <Scene key="Start" component={Start} title="Start" initial={true} />
      </Scene>
    </Router>
  );
}

function mapStateToProps(state) {
  return {
    appData: state.appData
  };
}

export default connect(mapStateToProps, null)(App);