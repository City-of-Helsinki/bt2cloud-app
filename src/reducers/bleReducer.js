// Template for redux data fetching reducer

import { BLE_START, BLE_SCAN_START, BLE_SCAN_ENDED, BLE_CONNECT } from '../constants';
const initialState = {
  started: false,
  startError: null,
  scanning: false,
  scanError: null,
  peripherals: [],
  connectError: null,
};

export default function bleReducer (state = initialState, action) {
  switch (action.type) {
    case BLE_START: 
      return {
        ...state,
        started: true,
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
        peripherals: action.peripherals,
      };
    case BLE_CONNECT:
      peripherals = state.peripherals;
      // if connect success, modify connected peripheral to append its service&charac
      // information and give it a connected=true flag
      if (action.data) {
        for (p in peripherals) {
          if (peripherals[p].id === action.device.id) {
            updated_p = Object.assign({}, peripherals[p], action.data);
            peripherals[p] = updated_p;
          }
        }
      }
      return {
        ...state,
        peripherals,
        connectError: action.error,
      };      
    default:
      return state;
  }
};