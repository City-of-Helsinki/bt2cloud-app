import { 
  BLE_START, 
  BLE_SCAN_START, 
  BLE_SCAN_ENDED, 
  BLE_CONNECTING,
  BLE_CONNECT_ERROR,
  BLE_UPDATE_CONNECTED_PERIPHERALS,
  BLE_UPDATE_AVAILABLE_PERIPHERALS,
  BLE_UPDATE_KNOWN_PERIPHERALS,
  BLE_READ,
  BLE_READ_ERROR,
  BLE_APPEND_READ_HISTORY,
  BLE_NOTIFY,
  BLE_NOTIFY_STOP,
  BLE_NOTIFY_ERROR,
  BLE_NOTIFY_STARTED,
  BLE_NOTIFY_STOPPED,
  BLE_FAVORITE_ADD,
  BLE_FAVORITE_REMOVE,
  SETTINGS_CHANGE_FLUSH_TO_DISK,
  SETTINGS_CHANGE_GPS_INTERVAL,
  SETTINGS_SET_DEVICE_INFO,
  FILE_TAG_DATA,
} from '../constants';

import BleManager from 'react-native-ble-manager';
import DeviceInfo from 'react-native-device-info';

import realm from '../realm';
import Utils from '../utils/utils';


// START BLE MANAGER ACTIONS

export function bleStartResult(error) {
  return {
    type: BLE_START,
    started: typeof error === "undefined" ? true : false,
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
        dispatch(bleStartResult(err.message));
      });
  }

}

// STARTED SCAN ACTIONS
export function bleScanStartResult(error) {
  return {
    type: BLE_SCAN_START,
    scanning: typeof error === "undefined" ? true : false,
    error: error,
    startScanByDefault: typeof error === "undefined" ? true : false,
  }
}

export function bleScanStart() {
  return (dispatch) => {
    BleManager.scan([], 60)
      .then(() => {
        dispatch(bleScanStartResult());
      })
      .catch((err) => {
        dispatch(bleScanStartResult(err.message));
      });
  }
}

// MANUAL END SCAN
export function bleScanStop() {
  return (dispatch) => {
    BleManager.stopScan()
      .then(() => {
        dispatch(bleScanEnded(false));
      })
      .catch((err) => {
        console.log('scan end error');
      });
  }
}

// SCAN ENDED
export function bleScanEnded(autoRestartScan=true) {
  return {
    type: BLE_SCAN_ENDED,
    startScanByDefault: autoRestartScan,
  }
}

// CONNECT/DISCONNECT ERROR
export function bleConnectError(device, error) {
  return {
    type: BLE_CONNECT_ERROR,
    device,
    error,
  }
}

// USER CONNECTS TO PERIPHERAL

export function bleConnecting(device) {
  return {
    type: BLE_CONNECTING,
    device,
  }
}

export function bleConnect(device) {
  return (dispatch) => {
    BleManager.connect(device.id)
      .then((data)=>{
        let { id } = data;
        let name;
        try {
          name = data.name;
        }
        catch(err) {
          name = 'no name';
        }
        realm.write(()=>{
          realm.create('Device', {id, name}, true);
        });        
        dispatch(bleUpdateKnownPeripherals(data));
      })
      .catch((err) => {
        dispatch(bleConnectError(device, err));
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
        dispatch(bleConnectError(err));
      })
  }  
}

// REFRESH AVAILABLE PERIPHERALS
export function getAvailablePeripherals() {
  return (dispatch) => {
    BleManager.getDiscoveredPeripherals([])
      .then((peripherals) => {
        dispatch(bleUpdateAvailablePeripherals(null, peripherals));
      })
      .catch((err) => {
        console.log('error getting peripherals', err);
      });
  }
}

export function bleUpdateAvailablePeripherals(peripheral, peripherals){
  return {
    type: BLE_UPDATE_AVAILABLE_PERIPHERALS,
    peripheral,
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

export function bleUpdateKnownPeripherals(data){
  return {
    type: BLE_UPDATE_KNOWN_PERIPHERALS,
    data,
  } 
}

export function bleReadError(deviceID, service, characteristic, error) {
  return {
    type: BLE_READ_ERROR,
    error: {
      deviceID,
      service,
      characteristic,    
      message: error,
    }
  }
}

export function bleAppendReadHistory(deviceID, service, characteristic, data) {
  return {
    type: BLE_APPEND_READ_HISTORY,
    deviceID,
    service,
    characteristic,
    data,
  }
}

export function bleRead(deviceID, service, characteristic) {
  return (dispatch) => {
    if (!deviceID || !service || !characteristic) return;
    BleManager.read(deviceID, service, characteristic)
      .then((data)=> {

        let jsonObject = {
          deviceID,
          service,
          characteristic,
          hex: data,
          ascii: Utils.hexDecode(data),
          time: new Date(),
        };

        realm.write(() => {
          realm.create('Data', jsonObject);
        });

        Utils.writeToFile(jsonObject, FILE_TAG_DATA);
        dispatch(bleAppendReadHistory(deviceID, service, characteristic, data));
      })
      .catch((error)=>{
        console.log(error);
        dispatch(bleReadError(deviceID, service, characteristic, error.message));
      });
  }
}

export function bleNotifyError(deviceID, service, characteristic, error) {
  return {
    type: BLE_NOTIFY_ERROR,
    error: {
      deviceID,
      service,
      characteristic,    
      message: error,
    }
  }
}

export function bleNotifyStarted(deviceID, characteristic) {
  return {
    type: BLE_NOTIFY_STARTED,
    deviceID,
    characteristic,
  }
}

export function bleNotifyStopped(characteristic) {
  return {
    type: BLE_NOTIFY_STOPPED,
    characteristic,
  }
}

export function bleNotify(deviceID, service, characteristic) {
  return (dispatch) => {
    if (!deviceID || !service || !characteristic) return;
    BleManager.startNotification(deviceID, service, characteristic)
      .then(()=> {
        dispatch(bleNotifyStarted(deviceID, characteristic))
      })
      .catch((error)=>{
        console.log(error);
        dispatch(bleNotifyError(deviceID, service, characteristic, error.message));
      });
  }
}

export function bleNotifyStop(deviceID, service, characteristic) {
  return (dispatch) => {
    if (!deviceID || !service || !characteristic) return;
    BleManager.stopNotification(deviceID, service, characteristic)
      .then(()=> {
        dispatch(bleNotifyStopped(characteristic))
      })
      .catch((error)=>{
        console.log(error);
      });
  }
}

export function bleFavoriteAdd(device) {
  return (dispatch)=> {
    realm.write(()=>{
      realm.create('Device', {id: device.id, name: device.name, favorite: true}, true);
    });
    dispatch(bleUpdateKnownPeripherals());
  }
}

export function bleFavoriteRemove(device) {
  return (dispatch)=> {
    realm.write(()=>{
      realm.create('Device', {id: device.id, name: device.name, favorite: false}, true);
    });
    dispatch(bleUpdateKnownPeripherals());
  }
}

// END BLE MANAGER ACTIONS

// START SETTINGS ACTIONS

export function settingsChangeFlushToDisk(value) {
  return {
    type: SETTINGS_CHANGE_FLUSH_TO_DISK,
    value,
  }
}

export function settingsChangeGPSInterval(value) {
  return {
    type: SETTINGS_CHANGE_GPS_INTERVAL,
    value,
  }
}

export function settingsSetDeviceInfo(id, model, os) {
  return {
    type: SETTINGS_SET_DEVICE_INFO,
    id,
    model,
    os,
  }
}

export function getDeviceInfo() {
  return async (dispatch)=> {
    let id = await DeviceInfo.getUniqueID();
    let model = await DeviceInfo.getModel();
    let systemName = await DeviceInfo.getSystemName();
    let systemVersion = await DeviceInfo.getSystemVersion();
    let os = systemName + ' ' + systemVersion;
    dispatch(settingsSetDeviceInfo(id, model, os));
  }
}