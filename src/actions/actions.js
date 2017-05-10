import { BLE_START, BLE_SCAN_START, BLE_SCAN_ENDED, BLE_CONNECT, FAKE_DEVICE } from '../constants';
import BleManager from 'react-native-ble-manager';
import { PermissionsAndroid } from 'react-native';


// START BLE MANAGER ACTIONS

export function bleStartResult(error) {
  return {
    type: BLE_START,
    started: !error,
    error: error
  }
}

export function bleStart() {
  return (dispatch) => {
    BleManager.start({showAlert: false})
      .then(()=> {
        dispatch(bleStartResult());
      })
      .catch((err) => {
        console.log('failure starting ble');
        dispatch(bleStartResult(err));
      });
  }

}

// STARTED SCAN ACTIONS
export function bleScanStartResult(error) {
  return {
    type: BLE_SCAN_START,
    scanning: !error,
    error: error
  }
}

export function bleScanStart() {
  return (dispatch) => {
    BleManager.scan([], 10)
      .then(() => {
        dispatch(bleScanStartResult());
      })
      .catch((err) => {
        console.log('scan error');
        dispatch(bleScanStartResult(err));
      });
  }
}

// STOPPED SCAN ACTIONS
export function bleScanResult(peripherals) {
  return {
    type: BLE_SCAN_ENDED,
    peripherals
  }
}

export function bleScanEnded() {
  return (dispatch) => {
    BleManager.getDiscoveredPeripherals([])
      .then((peripherals) => {
        peripherals = peripherals.filter((p)=> {
          return p.hasOwnProperty('name') && p.name.length > 0;
        });
        dispatch(bleScanResult(peripherals));
      })
      .catch((err) => {
        console.log('error getting peripherals', err);
      });
  }
}

// TODO CONNECT/DISCONNECT TO PERIPHERAL ACTIONS
export function bleConnectResult(device, data, error) {
  return {
    type: BLE_CONNECT,
    device,
    data,
    error,
  }
}

export function bleConnect(device) {
  return (dispatch) => {
    console.log('bleConnect', device.id)
    BleManager.connect(device.id)
      .then((data)=>{
        data['connected'] = true;
        dispatch(bleConnectResult(device, data, null));
      })
      .catch((err) => {
        console.log ('error connecting to peripheral', err);
        dispatch(bleConnectResult(device, null, err));
      })
  }
}

export function bleDisconnect() {
  
}

// TODO READ FROM / WRITE TO PERIPHERAL ACTIONS

export function bleRead() {
  
}

export function bleWrite() {
  
}