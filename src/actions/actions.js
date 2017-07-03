import {
  BLE_START,
  BLE_STARTING,
  BLE_SCAN_START,
  BLE_SCAN_STARTING,
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
  BLE_AUTONOTIFY_STARTING,
  BLE_FAVORITE_ADD,
  BLE_FAVORITE_REMOVE,
  SETTINGS_CHANGE_FLUSH_TO_DISK,
  SETTINGS_CHANGE_GPS_INTERVAL,
  SETTINGS_SET_DEVICE_INFO,
  FILE_TAG_DATA,
  FILESYSTEM_UPLOADING,
  FILESYSTEM_UPLOADING_DONE,
} from '../constants';

import BGTimer from 'react-native-background-timer';
// START BLE MANAGER ACTIONS

export function bleStartResult(error) {
  return {
    type: BLE_START,
    started: typeof error === "undefined" ? true : false,
    error: error
  }
}

export function bleStart(BleManager) {
  return (dispatch) => {
    dispatch({type: BLE_STARTING});
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

export function bleScanStart(BleManager) {
  return (dispatch) => {
    dispatch({type: BLE_SCAN_STARTING});
    console.log('SCAN STARTING');
    BleManager.scan([], 3600)
      .then(() => {
        dispatch(bleScanStartResult());
      })
      .catch((err) => {
        dispatch(bleScanStartResult(err.message));
      });
  }
}

// MANUAL END SCAN
export function bleScanStop(BleManager) {
  return (dispatch) => {
    BleManager.stopScan()
      .then(() => {
        console.log('scanStopped');
        dispatch(bleScanEnded(BleManager, false));
      })
      .catch((err) => {
        console.log('scan end error');
      });
  }
}

// SCAN ENDED
export function bleScanEnded(BleManager, autoRestartScan=true) {
  return (dispatch) => {
    // get discovered peripherals after scan and restart if user didnt manually stop
    BleManager.getDiscoveredPeripherals([])
      .then((peripherals) => {
        dispatch(bleUpdateAvailablePeripherals(null, peripherals));
        if (autoRestartScan) {
          BGTimer.setTimeout(() => dispatch(bleScanStart(BleManager)), 500);

        }
        else dispatch({
          type: BLE_SCAN_ENDED,
          startScanByDefault: false,
        });
      })
      .catch((err) => {
        console.log('error getting peripherals', err);
        if (autoRestartScan) {
          dispatch(bleScanStart(BleManager));
        }
        else dispatch({
          type: BLE_SCAN_ENDED,
          startScanByDefault: false,
        });
      });
  };
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

export function bleConnect(BleManager, realm, device, hasAutoConnect) {
  return (dispatch) => {
    console.log('bleConnect');
    BleManager.connect(device.id)
      .then(()=>{
        BleManager.retrieveServices(device.id)
          .then((data)=>{
            console.log('retrieved services');
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
        });
      })
      .catch((err) => {
        dispatch(bleConnectError(device, err));
        /*if (hasAutoConnect) {
          dispatch(bleConnecting(device));
          dispatch(bleConnect(BleManager, realm, device, hasAutoConnect));
        }*/
      })
  }
}

export function bleDisconnect(BleManager, device) {
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
export function getAvailablePeripherals(BleManager) {
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
export function getConnectedPeripherals(BleManager) {
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
  }
}

export function bleRead(store, BleManager, realm, Utils, deviceID, service, characteristic) {
  return (dispatch) => {
    if (!deviceID || !service || !characteristic) return;
    BleManager.read(deviceID, service, characteristic)
      .then((data)=> {
        let jsonObject = {
          deviceID,
          service,
          characteristic,
          hex: Array.isArray(data) ? '' : data,
          ascii: Array.isArray(data) ? Utils.byteToText(data) : Utils.hexDecode(data),
          time: new Date(),
        };

        realm.write(() => {
          realm.create('Data', jsonObject);
        });
        Utils.writeToFile(store,jsonObject, FILE_TAG_DATA);
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

export function bleNotifyStarted(deviceID, charObject) {
  return {
    type: BLE_NOTIFY_STARTED,
    deviceID,
    charObject,
  }
}

export function bleNotifyStopped(characteristic) {
  return {
    type: BLE_NOTIFY_STOPPED,
    characteristic,
  }
}

export function bleNotify(BleManager, deviceID, charArray) {
  return (dispatch) => {
    console.log('bleNotify');
    BleManager.startNotification(deviceID, charArray[0].service, charArray[0].characteristic)
      .then(()=> {
        console.log('Notify started for ' + charArray[0].characteristic);
        dispatch(bleNotifyStarted(deviceID, charArray[0]));
        charArray.splice(0,1);
        if (charArray.length > 0) {
            dispatch(bleNotify(BleManager, deviceID, charArray));
        }
      })
      .catch((error)=>{
        console.log(error);
        dispatch(bleNotifyError(deviceID, charArray[0].service, charArray[0].characteristic, error.message));
      });
  }
}

export function bleNotifyStop(BleManager, deviceID, charArray) {
  return (dispatch) => {
    BleManager.stopNotification(deviceID, charArray[0].service, charArray[0].characteristic)
      .then(()=> {
        dispatch(bleNotifyStopped(charArray[0].characteristic))
        charArray.splice(0,1);
        if (charArray.length > 0) dispatch(bleNotifyStop(BleManager, deviceID, charArray));
      })
      .catch((error)=>{
        console.log(error);
      });
  }
}

export function bleAutoNotifyStarting(deviceID) {
  return {
    type: BLE_AUTONOTIFY_STARTING,
    id: deviceID,
  };
}

export function bleAutoNotifyStarted(deviceID) {
  return {
    type: BLE_AUTONOTIFY_STARTED,
    id: deviceID,
  };
}

export function bleModifyDevice(realm, device, favorite, autoConnect, autoNotify) {
  return (dispatch)=> {
    realm.write(()=>{
      realm.create('Device', {
        id: device.id,
        name: device.name,
        favorite,
        autoConnect,
        autoNotify,
      }, true);
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

export function getDeviceInfo(DeviceInfo) {
  return async (dispatch)=> {
    let id = await DeviceInfo.getUniqueID();
    let model = await DeviceInfo.getModel();
    let systemName = await DeviceInfo.getSystemName();
    let systemVersion = await DeviceInfo.getSystemVersion();
    let os = systemName + ' ' + systemVersion;
    dispatch(settingsSetDeviceInfo(id, model, os));
  }
}
