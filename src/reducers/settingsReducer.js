import Utils from '../utils/utils';
import realm from '../realm';
import { 
  SETTINGS_CHANGE_FLUSH_TO_DISK, 
  SETTINGS_CHANGE_GPS_INTERVAL,
  SETTINGS_SET_DEVICE_INFO,
} from '../constants';
import {
  TEST_BACKEND_URL,
} from '../../localSettings';

const initialState = {
  deviceInfo: {
    id: '12345',
    model: 'AiFöyn',
    os: '66.6',
  },
  flushToDiskInterval: Utils.convertRealmResultsToArray(realm.objects('Settings'))[0].flushToDiskInterval,
  GPSInterval: Utils.convertRealmResultsToArray(realm.objects('Settings'))[0].saveGPSInterval,
  initializing: true,
  activeBackend: {
    url: TEST_BACKEND_URL,
    user: null,
    pass: null,
    api_key: null,
  }
};

export default function settingsReducer (state = initialState, action) {
  switch (action.type) {

    case SETTINGS_CHANGE_FLUSH_TO_DISK:
      return {
        ...state,
        flushToDiskInterval: action.value,
      }
    case SETTINGS_CHANGE_GPS_INTERVAL:
      return {
        ...state,
        GPSInterval: action.value,
      }
    case SETTINGS_SET_DEVICE_INFO:
      let { id, model, os } = action;
      return {
        ...state,
        deviceInfo: {
          id,
          model,
          os,
        },
        initializing: false,
      }

    default:
      return state;
  }
};