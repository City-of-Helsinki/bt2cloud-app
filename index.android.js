import React from 'react';
import {
  AppRegistry,
  NativeAppEventEmitter,
} from 'react-native';

import BGTimer from 'react-native-background-timer';
import { Provider } from 'react-redux';
import store from './src/store';
import App from './src/app';
import configureBackgroundMode from './src/configureBackgroundMode';

import { GPS_OPTIONS, FILE_TAG_GPS, SECONDARY_LOCATION_OPTIONS } from './src/constants';
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

// watch for both accurate and coarse location and update whichever successfully provides location
const watchID_secondary = navigator.geolocation.watchPosition((position) => {
  	lastPosition = position.coords;
  },
    (error) => {
    	console.log(error)
    }, SECONDARY_LOCATION_OPTIONS);
const watchID = navigator.geolocation.watchPosition((position) => {
  	lastPosition = position.coords;
  },
    (error) => {
    	console.log(error)
    }, GPS_OPTIONS);

setGPSTrigger = (interval) => {
  GPSTrigger = BGTimer.setInterval(()=>{
  	try {
  		if (lastPosition) {
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

if (store.getState().settings.backgroundMode) configureBackgroundMode.enable();




const Bt2Cloud = () => (
  <Provider store={store}>
    <App />
  </Provider>
)

AppRegistry.registerComponent('Bt2Cloud', () => Bt2Cloud);

export default Bt2Cloud;
