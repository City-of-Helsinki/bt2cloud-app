import Utils from './utils';
import BleManager from 'react-native-ble-manager';
import BGTimer from 'react-native-background-timer';
import realm from '../realm';
import Toast from '@remobile/react-native-toast';
import { AppState, Vibration } from 'react-native';
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

		let deviceID = peripheral.id;
		// parse legible text from here
		// let base64Array = new Buffer(peripheral.advertising.data, 'base64').toString('ascii').split('');
		let state = store.getState();
		if (!state.ble.peripherals.map(p=>p.id).includes(deviceID)) {
			store.dispatch(bleUpdateAvailablePeripherals(peripheral, null));
		}

		let hasAutoConnect = state.ble.knownPeripherals.filter(p=>p.autoConnect === true & p.id === deviceID);
		let connecting = state.ble.connectingPeripherals.includes(deviceID);
		if (hasAutoConnect.length !== 0 && !connecting) {
			store.dispatch(bleConnecting({id: deviceID}));
			store.dispatch(bleConnect(BleManager, realm, {id: deviceID}));
		}		
	},

	handleConnectPeripheral(data) {		
		let that=this;
		let state = store.getState();
		store.dispatch(getConnectedPeripherals(BleManager));
		let deviceID = data.peripheral;
		if (AppState.currentState === 'active') {
			Toast.showShortCenter('Connected to ' + deviceID);		
		}
		console.log('Connected to ' + deviceID);
    let hasAutoNotify = state.ble.knownPeripherals.filter(p=>p.autoNotify === true & p.id === deviceID);
    if (hasAutoNotify.length !== 0 && !state.ble.startingAutoNotify) {
      // Dirty hack. Prevents 2 concurrent retrieveServices native calls
      // Concurrent calls cause promise to never resolve.
      BGTimer.setTimeout(()=>{
      	that.handleAutoNotify(deviceID);
      }, 2000);
    }
	},

	handleDisconnectPeripheral(data) {
		if (!data) return;
		if (!data.hasOwnProperty('peripheral')) return;
		let deviceID = data.peripheral;
		let state = store.getState();
		let { notifyingChars, peripheralServiceData, connectingPeripherals } = state.ble;

		if (AppState.currentState === 'active') {
			Toast.showShortCenter('Disconnected from ' + deviceID);
		}
		else {
			Vibration.vibrate();
		}
		
		console.log('notifying chars: ' + notifyingChars);

		// TODO REMOVE ALL NOTIFYING CHARS FROM STATE ON DISCONNECT
		let disconnectedDevicesChars = notifyingChars.filter(c=>c.deviceID === deviceID)
			.map(ch=>ch.characteristic);
		disconnectedDevicesChars.forEach(dc => store.dispatch(bleNotifyStopped(dc)));
		
		store.dispatch(getConnectedPeripherals(BleManager));
		state = store.getState();
		
		// wait for state to really reflect if the device is still trying to connect
		// if not, try again
		BGTimer.setTimeout(()=> {
			let hasAutoConnect = state.ble.knownPeripherals.filter(p=>p.autoConnect === true & p.id === deviceID);
			let connecting = state.ble.connectingPeripherals.includes(deviceID);			
			if (hasAutoConnect.length !== 0 && !connecting) {
				store.dispatch(bleConnecting({id: deviceID}));
				store.dispatch(bleConnect(BleManager, realm, {id: deviceID}));
			}			
		}, 1000)
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
		//store.dispatch(getAvailablePeripherals(BleManager));
		console.log(store.getState().ble.startScanByDefault);
		store.dispatch(bleScanEnded(BleManager, store.getState().ble.startScanByDefault));
	},

	handleAutoConnect(autoConnectPeripherals) {
		// If device is set to autoConnect in DB, try to connect (unless already connected/connecting)
		let { peripherals, connectedPeripherals, connectingPeripherals, knownPeripherals} = store.getState().ble;
		autoConnectPeripherals.forEach((per) => {
			let inRange = peripherals.map(p=>p.id).includes(per.id);
			let connected = connectedPeripherals.map(p=>p.id).includes(per.id);
			let connecting = connectingPeripherals.includes(per.id);

			if (inRange && !connected && !connecting) {
				console.log('attempting to autoconnect');
				let hasAutoConnect = true;
				store.dispatch(bleConnecting(per));
				store.dispatch(bleConnect(BleManager, realm, per, hasAutoConnect));
			}
		});
	},	

	handleAutoNotify(deviceID) {
		// If device is set to autoNotify in DB, start notify on all notify-able chars
    console.log('handleAutoNotify ' + deviceID);
    let state = store.getState();
    try {
		BleManager.retrieveServices(deviceID)
			.then((data)=>{
				console.log('handleautonotify promise resolves');
				console.log('data: ' + data);
				if (!data.characteristics) return;
				let notifyableChars = data.characteristics.filter((c)=>{
					return c.properties.hasOwnProperty('Notify') && c.properties.Notify === 'Notify';
				});

        // characteristics that are not notifying and their device is connected
        let charArray = notifyableChars.filter((nc)=> {
          let notifying = state.ble.notifyingChars.map(c=>c.characteristic).includes(nc.characteristic);
          let connected = state.ble.connectedPeripherals.map(p=>p.id).includes(deviceID);
          return !notifying && connected;
        });
        let sendCharArray = charArray.slice();
        if (charArray.length > 0) store.dispatch(bleNotify(BleManager, deviceID, sendCharArray));
		})
    .catch((err) => {
      console.log(err);
    });
  	}
  	catch (err) {
  		console.log('autonotify error: ', err);
  	}
	},	
}

export default Handlers;