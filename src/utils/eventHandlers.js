import Utils from './utils';
import BleManager from 'react-native-ble-manager';
import BGTimer from 'react-native-background-timer';
import realm from '../realm';
import Toast from '@remobile/react-native-toast';
import { AppState } from 'react-native';
import store from '../store';

import { FILE_TAG_DATA } from '../constants';

import { 
	bleStart, 
	bleScanStart, 
	bleScanStop,
	bleScanEnded, 
	bleConnect, 
	bleConnecting,
	bleDisconnect,
	getConnectedPeripherals,
	getAvailablePeripherals,
	bleUpdateAvailablePeripherals,
	bleAppendReadHistory, 
	bleNotify,
	bleNotifyStopped,
	bleModifyDevice,
} from '../actions/actions';

const Handlers = {
	// this gets called multiple times per device upon discovery
	// cannot be prevented on android
	handleDiscoverPeripheral(peripheral) {

		// parse legible text from here
		// let base64Array = new Buffer(peripheral.advertising.data, 'base64').toString('ascii').split('');
		let state = store.getState();
		if (!state.ble.peripherals.map(p=>p.id).includes(peripheral.id)) {
			store.dispatch(bleUpdateAvailablePeripherals(peripheral, null));
		}
	},

	handleConnectPeripheral(data) {		
		let state = store.getState();
		store.dispatch(getConnectedPeripherals(BleManager));
		let deviceID = data.peripheral;
		if (AppState.currentState === 'active') {
			Toast.showShortCenter('Connected to ' + deviceID);		
		}
		console.log('Connected to ' + deviceID);
    let hasAutoNotify = state.ble.knownPeripherals.filter(p=>p.autoNotify === true & p.id === deviceID);
    if (hasAutoNotify.length !== 0) {
      // Dirty hack. Prevents 2 concurrent retrieveServices native calls
      // Concurrent calls cause promise to never resolve.
      BGTimer.setTimeout(()=>{
      	this.handleAutoNotify(deviceID);
      }, 600);
    }
	},

	handleDisconnectPeripheral(data) {
		if (!data) return;
		if (!data.hasOwnProperty('peripheral')) return;
		let deviceID = data.peripheral;
		let state = store.getState();
		let { notifyingChars, peripheralServiceData } = state.ble;

		if (AppState.currentState === 'active') {
			Toast.showShortCenter('Disconnected from ' + deviceID);
		}
		else {
			Vibration.vibrate();
		}
		

		if (peripheralServiceData && peripheralServiceData.length > 0) {

			// TODO REMOVE ALL NOTIFYING CHARS FROM STATE ON DISCONNECT
			let disconnectedDevicesChars = notifyingChars.filter(c=>c.deviceID === deviceID)
				.map(ch=>ch.characteristic);
			disconnectedDevicesChars.forEach(dc => store.dispatch(bleNotifyStopped(dc)));
		}
		
		store.dispatch(getConnectedPeripherals(BleManager));
		// this.props.getAvailablePeripherals();
	},

	handleNotification(data) {
		console.log('handleNotification');
		if (!data) return;
		let deviceID = data.peripheral;
		let characteristic = data.characteristic
		let service = data.service
		let hex = Array.isArray(data.value) ? '' : data.value;
		let ascii = Array.isArray(data.value) ? Utils.byteToText(data.value) : Utils.hexDecode(data.value);
    let jsonObject = {
      deviceID,
      service,
      characteristic,
      hex,
      ascii,
      time: new Date(),
    };
    realm.write(() => {
      realm.create('Data', jsonObject);
    });
    Utils.writeToFile(store, jsonObject, FILE_TAG_DATA);
    if (AppState.currentState === 'active') {
    	store.dispatch(bleAppendReadHistory());
    }
	},

	handleScanEnded() {
		store.dispatch(getAvailablePeripherals(BleManager));
		store.dispatch(bleScanEnded());
	},
}

export default Handlers;