import { 
  BLE_START, 
  BLE_SCAN_START, 
  BLE_SCAN_ENDED, 
  BLE_CONNECT_ERROR,
  BLE_UPDATE_CONNECTED_PERIPHERALS,
  BLE_UPDATE_AVAILABLE_PERIPHERALS,
  BLE_UPDATE_PERIPHERALS_WITH_SERVICES
} from '../constants';
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
    BleManager.scan([], 60)
      .then(() => {
        dispatch(bleScanStartResult());
      })
      .catch((err) => {
        console.log('scan error');
        dispatch(bleScanStartResult(err));
      });
  }
}

// MANUAL END SCAN
export function bleScanStop() {
  return (dispatch) => {
    BleManager.stopScan()
      .then(() => {
        dispatch(bleScanEnded());
      })
      .catch((err) => {
        console.log('scan end error');
      });
  }
}

// SCAN ENDED
export function bleScanEnded() {
  return {
    type: BLE_SCAN_ENDED,
    scanning: false,
  }
}

// CONNECT/DISCONNECT ERROR
export function bleConnectError(error) {
  return {
    type: BLE_CONNECT_ERROR,
    error,
  }
}

// USER CONNECTS TO PERIPHERAL
export function bleConnect(device) {
  return (dispatch) => {
    console.log('bleConnect', device.id)
    BleManager.connect(device.id)
      .then((data)=>{
        console.log ('got data: ', data);
        dispatch(bleUpdatePeripheralsWithServices(data));
      })
      .catch((err) => {
        console.log ('error connecting to peripheral', err);
        dispatch(bleConnectError(err));
      })
  }
}

export function bleDisconnect(device) {
  return (dispatch) => {
    BleManager.disconnect(device.id)
      .then((data)=>{
        dispatch(getConnectedPeripherals());
      })
      .catch((err) => {
        console.log ('error disconnecting from peripheral', err);
        dispatch(bleConnectError(err));
      })
  }  
}

// REFRESH AVAILABLE PERIPHERALS
export function getAvailablePeripherals() {
  return (dispatch) => {
    BleManager.getDiscoveredPeripherals([])
      .then((peripherals) => {
        console.log('Available: ', peripherals);
        peripherals = peripherals.filter(p=> p.hasOwnProperty('name') && p.name.length > 0);
        dispatch(bleUpdateAvailablePeripherals(peripherals));
      })
      .catch((err) => {
        console.log('error getting peripherals', err);
      });
  }
}

export function bleUpdateAvailablePeripherals(peripherals){
  return {
    type: BLE_UPDATE_AVAILABLE_PERIPHERALS,
    peripherals
  } 
}

// REFRESH CONNECTED PERIPHERALS
export function getConnectedPeripherals() {
  return (dispatch) => {
    BleManager.getConnectedPeripherals([])
      .then((peripherals) => {
        dispatch(bleUpdateConnectedPeripherals(peripherals));
      })
      .catch((err) => {
        console.log('error getting peripherals', err);
      });
  }
}

export function bleUpdateConnectedPeripherals(peripherals){
  return {
    type: BLE_UPDATE_CONNECTED_PERIPHERALS,
    peripherals
  } 
}

export function bleUpdatePeripheralsWithServices(device){
  return {
    type: BLE_UPDATE_PERIPHERALS_WITH_SERVICES,
    device
  } 
}

// TODO READ FROM / WRITE TO PERIPHERAL ACTIONS

export function bleRead() {
  
}

export function bleWrite() {
  
}