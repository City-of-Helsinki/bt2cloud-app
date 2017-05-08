// Template for redux data fetching reducer

import { BLE_START, BLE_SCAN_START, BLE_SCAN_ENDED } from '../constants';
const initialState = {
  started: false,
  startError: null,
  scanning: false,
  scanError: null,
  peripherals: [],
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
    default:
      return state;
  }
};