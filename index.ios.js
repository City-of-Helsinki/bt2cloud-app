import React from 'react';
import {
  AppRegistry,
} from 'react-native';

import { Provider } from 'react-redux';
import configureStore from './src/configureStore';
import App from './src/app';

const store = configureStore()

const Bt2Cloud = () => (
  <Provider store={store}>
    <App />
  </Provider>
)

AppRegistry.registerComponent('Bt2Cloud', () => Bt2Cloud);

export default Bt2Cloud;
