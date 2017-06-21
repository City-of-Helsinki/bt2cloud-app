import Utils from '../utils/utils';
import realm from '../realm';
import {
  SETTINGS_CHANGE_FLUSH_TO_DISK,
  SETTINGS_CHANGE_GPS_INTERVAL,
  SETTINGS_SET_DEVICE_INFO,
  SETTINGS_REFRESH,
  SETTINGS_SET_BACKGROUND_MODE,
} from '../constants';

const initialState = {
  deviceInfo: {
    id: '12345',
    model: 'AiFöyn',
    os: '66.6',
  },
  flushToDiskInterval: Utils.convertRealmResultsToArray(realm.objects('Settings'))[0].flushToDiskInterval,
  GPSInterval: Utils.convertRealmResultsToArray(realm.objects('Settings'))[0].saveGPSInterval,
  initializing: true,
  activeBackend: Utils.convertRealmResultsToArray(realm.objects('Settings'))[0].activeBackend,
  backgroundMode: false,
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

    case SETTINGS_SET_BACKGROUND_MODE:
      return {
        ...state,
        backgroundMode: action.on,
      }

    case SETTINGS_REFRESH:
      let activeBackend = Utils.convertRealmResultsToArray(realm.objects('Settings'))[0].activeBackend;
      return {
        ...state,
        activeBackend,
      };

    default:
      return state;
  }
};
