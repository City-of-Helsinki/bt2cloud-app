import React from 'react';
import {
  AppRegistry,
} from 'react-native';

import { Provider } from 'react-redux';
import configureStore from './src/configureStore';
import App from './src/app';

const store = configureStore()

const BLE_sovellus = () => (
  <Provider store={store}>
    <App />
  </Provider>
)

AppRegistry.registerComponent('BLE_sovellus', () => BLE_sovellus);