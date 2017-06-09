import React from 'react';
import {
  AppRegistry,
  NativeAppEventEmitter,
} from 'react-native';

import BackgroundJob from 'react-native-background-job';
import BGTimer from 'react-native-background-timer';
import { Provider } from 'react-redux';
import App from './src/app';
import store from './src/store';

import { GPS_OPTIONS, FILE_TAG_GPS } from './src/constants';
import Utils from './src/utils/utils';
import eventHandlers from './src/utils/eventHandlers';

//BLE EVENT HANDLERS

eventHandlers.handleScanEnded = eventHandlers.handleScanEnded.bind(eventHandlers);
eventHandlers.handleDiscoverPeripheral = eventHandlers.handleDiscoverPeripheral.bind(eventHandlers);
eventHandlers.handleConnectPeripheral = eventHandlers.handleConnectPeripheral.bind(eventHandlers);
eventHandlers.handleDisconnectPeripheral = eventHandlers.handleDisconnectPeripheral.bind(eventHandlers);
eventHandlers.handleNotification = eventHandlers.handleNotification.bind(eventHandlers);
eventHandlers.handleAutoConnect = eventHandlers.handleAutoConnect.bind(eventHandlers);
eventHandlers.handleAutoNotify = eventHandlers.handleAutoNotify.bind(eventHandlers);	

NativeAppEventEmitter
			.addListener('BleManagerStopScan', eventHandlers.handleScanEnded);
NativeAppEventEmitter
			.addListener('BleManagerDiscoverPeripheral', eventHandlers.handleDiscoverPeripheral);
NativeAppEventEmitter
			.addListener('BleManagerConnectPeripheral', eventHandlers.handleConnectPeripheral);
NativeAppEventEmitter
			.addListener('BleManagerDisconnectPeripheral', eventHandlers.handleDisconnectPeripheral);		
NativeAppEventEmitter
			.addListener('BleManagerDidUpdateValueForCharacteristic', eventHandlers.handleNotification);	

// GPS EVENT HANDLERS... todo move to separate module because global variables are BAAAAAAAAAAAD.
lastPosition = null, GPSTrigger = null;
const watchID = navigator.geolocation.watchPosition((position) => {
  	console.log('successfully got watched location', position);
  	lastPosition = position.coords;
  },
    (error) => {
    	console.log(error)
    }, GPS_OPTIONS);
    
setGPSTrigger = (interval) => {
  GPSTrigger = BGTimer.setInterval(()=>{
  	try {
  		if (lastPosition.latitude) {
    		let gps = {
    			lat: lastPosition.latitude,
    			lon: lastPosition.longitude,
    			acc: lastPosition.accuracy.toFixed(3),
    			alt: lastPosition.altitude,
    			time: new Date(),
    		}
    		Utils.writeToFile(store, gps, FILE_TAG_GPS);
  		}
  	}
  	catch(err) {
  		console.log('error writing GPS to file', err);
  	}	      
  }, interval * 1000);		
}

setGPSTrigger(store.getState().settings.GPSInterval);

const foregroundService = true;

if (foregroundService) {
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
}





const BLE_sovellus = () => (
  <Provider store={store}>
    <App />
  </Provider>
)

AppRegistry.registerComponent('BLE_sovellus', () => BLE_sovellus);

export default BLE_sovellus;