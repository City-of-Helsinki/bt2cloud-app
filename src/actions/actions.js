import { BLE_START, BLE_SCAN_START, BLE_SCAN_ENDED, FAKE_DEVICE } from '../constants';
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
    BleManager.scan([], 3)
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
        peripherals.push(FAKE_DEVICE);
        dispatch(bleScanResult(peripherals));
      })
      .catch((err) => {
        console.log('error getting peripherals', err);
      });
  }
}

// TODO CONNECT/DISCONNECT TO PERIPHERAL ACTIONS
export function bleConnect() {
  
}

export function bleDisconnect() {
  
}

// TODO READ FROM / WRITE TO PERIPHERAL ACTIONS

export function bleRead() {
  
}

export function bleWrite() {
  
}