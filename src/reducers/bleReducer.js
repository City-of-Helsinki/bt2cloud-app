// Template for redux data fetching reducer

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
} from '../constants';
const initialState = {
  started: false,
  startError: null,
  scanning: false,
  scanError: null,
  peripherals: [], // available peripherals (scanned)
  connectedPeripherals: [], // currently connected peripherals
  peripheralsWithServices: [], // peripherals with known services (not necessarily connected)
  connectError: null,
  readError: null,
  readHistory: [],
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
      let date = new Date();
      let readHistory = state.readHistory;
      readHistory.push({
        deviceID,
        service,
        characteristic,
        data,
        date
      });

    return {
      ...state,
      readHistory,
    }

    default:
      return state;
  }
};