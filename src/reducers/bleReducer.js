import Utils from '../utils/utils';
import realm from '../realm';
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
  BLE_NOTIFY_ERROR,  
  BLE_NOTIFY_STARTED,
  BLE_NOTIFY_STOPPED,
} from '../constants';
const initialState = {
  started: false,
  startScanByDefault: true,
  startError: null,
  scanning: false,
  scanError: null,
  peripherals: [], // available peripherals (scanned)
  connectingPeripherals: [], // currently connecting to these peripherals
  connectedPeripherals: [], // currently connected peripherals
  knownPeripherals: Utils.convertRealmResultsToArray(realm.objects('Device')) || [], // in database
  peripheralServiceData: [], // service&charac info received on connect. ad hoc info; not persisted to database.
  connectError: null,
  readError: null,
  notifyError: null,
  notifyingChars: [],
};

export default function bleReducer (state = initialState, action) {

  let peripherals, connectingPeripherals, connectedPeripherals, knownPeripherals,
    peripheralServiceData, readHistory, notifyingChars;

  switch (action.type) {
    case BLE_START: 
      return {
        ...state,
        started: action.started,
        startError: action.error ? action.error : null
      };

    case BLE_SCAN_START: 
      // clear devices from state except those that are connected
      peripherals = state.connectedPeripherals.slice();
      return {
        ...state,
        scanning: action.scanning,
        peripherals, 
        scanError: action.error ? action.error : null
      };

    case BLE_SCAN_ENDED: 
      return {
        ...state,
        scanning: false,
        startScanByDefault: action.startScanByDefault,
      }; 

    case BLE_CONNECTING:
      connectingPeripherals = state.connectingPeripherals;
      if (!connectingPeripherals.includes(action.device.id)) connectingPeripherals.push(action.device.id);
      return {
        ...state,
        connectError: null,
        connectingPeripherals,
      }

    case BLE_CONNECT_ERROR:
      connectingPeripherals = state.connectingPeripherals.filter(p=> p !== action.device.id);
      return {
        ...state,
        connectError: action.error,
        connectingPeripherals,
      }

    case BLE_UPDATE_AVAILABLE_PERIPHERALS:
      if (action.peripherals) { // if we got all available peripherals, just update state to equal that array
        peripherals = action.peripherals;
      }
      if (action.peripheral) { // if we discovered 1 peripheral, append it instead of replacing the state array
        peripherals = state.peripherals;
        if (!peripherals.map(p=>p.id).includes(action.peripheral.id)) {
          peripherals.push(action.peripheral);
        }
      }
      return {
        ...state,
        peripherals,
      };  

    case BLE_UPDATE_CONNECTED_PERIPHERALS:
      connectedPeripherals = action.peripherals;
      connectingPeripherals = state.connectingPeripherals;
      peripherals = state.peripherals;

      connectingPeripherals = connectingPeripherals.filter(p => {
        return !connectedPeripherals.map(p2=>p2.id).includes(p) && peripherals.map(p3=>p3.id).includes(p);
      });

      return {
        ...state,
        connectedPeripherals,
        connectingPeripherals,
      }; 

    case BLE_UPDATE_KNOWN_PERIPHERALS:
      knownPeripherals = Utils.convertRealmResultsToArray(realm.objects('Device')) || [];
      peripheralServiceData = state.peripheralServiceData;
      if (action.data) {
        if (peripheralServiceData.length === 0 || !peripheralServiceData.map(p=>p.id).includes(action.data.id)) {
          peripheralServiceData.push(action.data);
        }
      }

      return {
        ...state,
        connectError: null,
        knownPeripherals,
        peripheralServiceData,
      };

    case BLE_READ_ERROR:
      return {
        ...state,
        readError: action.error,
      }

    case BLE_APPEND_READ_HISTORY:  
      readHistory = [];
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
      let { deviceID, charObject } = action;
      if (!notifyingChars.map(c=>c.characteristic).includes(action.characteristic)) {
        notifyingChars.push({deviceID, service: charObject.service, characteristic: charObject.characteristic});
      }

      return {
        ...state,
        notifyingChars,
      }

    case BLE_NOTIFY_STOPPED:
      notifyingChars = state.notifyingChars.filter(c=> c.characteristic !== action.characteristic);

      return {
        ...state,
        notifyingChars,
      }

    default:
      return state;
  }
};