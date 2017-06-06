import React from 'react';
import {
  AppRegistry,
} from 'react-native';

import BackgroundJob from 'react-native-background-job';
import { Provider } from 'react-redux';
import configureStore from './src/configureStore';
import App from './src/app';

const backgroundJob = {
	jobKey: 'keepAlive',
	job: () => console.log('Running in background...'),
};
const backgroundSchedule = {
	jobKey: 'keepAlive',
	timeout: 5000,
	alwaysRunning: true,
	notificationTitle: 'BT2Cloud',
	notificationText: 'I am running in the background so I can scan and record 24/7 for you',
};
BackgroundJob.register(backgroundJob);
BackgroundJob.schedule(backgroundSchedule);


const store = configureStore()

const BLE_sovellus = () => (
  <Provider store={store}>
    <App />
  </Provider>
)

AppRegistry.registerComponent('BLE_sovellus', () => BLE_sovellus);

export default BLE_sovellus;