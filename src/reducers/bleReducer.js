import Utils from '../utils/utils';

import { 
  BLE_START, 
  BLE_SCAN_START, 
  BLE_SCAN_ENDED, 
  BLE_CONNECT_ERROR,
  BLE_UPDATE_CONNECTED_PERIPHERALS,
  BLE_UPDATE_AVAILABLE_PERIPHERALS,
  BLE_UPDATE_PERIPHERALS_WITH_SERVICES,
  BLE_READ,
  BLE_READ_ERROR,
  BLE_APPEND_READ_HISTORY,
  BLE_NOTIFY,
  BLE_NOTIFY_ERROR,  
  BLE_NOTIFY_STARTED,
  BLE_NOTIFY_STOPPED,
  BLE_FAVORITE_ADD,
  BLE_FAVORITE_REMOVE,
} from '../constants';
const initialState = {
  started: false,
  startScanByDefault: true,
  startError: null,
  scanning: false,
  scanError: null,
  peripherals: [], // available peripherals (scanned)
  connectedPeripherals: [], // currently connected peripherals
  peripheralsWithServices: [], // peripherals with known services (not necessarily connected)
  favoritePeripherals: [],
  connectError: null,
  readError: null,
  readHistory: [],
  notifyError: null,
  notifyingChars: [],
};

export default function bleReducer (state = initialState, action) {
  switch (action.type) {
    case BLE_START: 
      return {
        ...state,
        started: action.started,
        startError: action.error ? action.error : null
      };

    case BLE_SCAN_START: 
      return {
        ...state,
        scanning: action.scanning,
        scanError: action.error ? action.error : null
      };

    case BLE_SCAN_ENDED: 
      return {
        ...state,
        scanning: false,
        startScanByDefault: action.startScanByDefault,
      }; 

    case BLE_CONNECT_ERROR:
      return {
        ...state,
        connectError: action.error,
      }

    case BLE_UPDATE_AVAILABLE_PERIPHERALS:
      console.log('update peripherals to: ', action.peripherals);
      peripherals = action.peripherals;
      return {
        ...state,
        peripherals,
      };  

    case BLE_UPDATE_CONNECTED_PERIPHERALS:
      connectedPeripherals = action.peripherals;
      return {
        ...state,
        connectedPeripherals,
      }; 

    case BLE_UPDATE_PERIPHERALS_WITH_SERVICES:
      peripheralsWithServices = state.peripheralsWithServices;
      peripheralIDs = peripheralsWithServices.map(p=>p.id);
      if (!peripheralIDs.includes(action.device.id)) peripheralsWithServices.push(action.device);
      return {
        ...state,
        connectError: null,
        peripheralsWithServices
      };

    case BLE_READ_ERROR:
      return {
        ...state,
        readError: action.error,
      }

    case BLE_APPEND_READ_HISTORY:  
      let { deviceID, service, characteristic, data } = action;
      let hex = data;
      let value = Utils.hexDecode(hex);
      let date = new Date();
      let readHistory = state.readHistory;
      readHistory.push({
        deviceID,
        service,
        characteristic,
        hex,
        value,
        date,
      });

    return {
      ...state,
      readHistory,
    }

    case BLE_NOTIFY_ERROR:
      return {
        ...state,
        notifyError: action.error,
      }

    case BLE_NOTIFY_STARTED:
      notifyingChars = state.notifyingChars;
      if (!notifyingChars.includes(action.characteristic)) notifyingChars.push(action.characteristic);

      return {
        ...state,
        notifyingChars,
      }

    case BLE_NOTIFY_STOPPED:
      console.log('BLE_NOTIFY_STOPPED', action.characteristic);
      notifyingChars = state.notifyingChars.filter(c=> c !== action.characteristic);

      return {
        ...state,
        notifyingChars,
      }

    case BLE_FAVORITE_ADD: 
      favoritePeripherals = state.favoritePeripherals;
      if (!state.favoritePeripherals.includes(action.deviceID)) {
        favoritePeripherals.push(action.deviceID);
      }
      return {
        ...state,
        favoritePeripherals
      }
    
    case BLE_FAVORITE_REMOVE: 
      console.log(action.deviceID);
      console.log(state.favoritePeripherals);
      favoritePeripherals = state.favoritePeripherals.filter(p=> p !== action.deviceID);
      return {
        ...state,
        favoritePeripherals
      }

    default:
      return state;
  }
};