import Utils from '../utils/utils';
import realm from '../realm';
import { 
  SETTINGS_CHANGE_FLUSH_TO_DISK, 
  SETTINGS_CHANGE_GPS_INTERVAL,
  SETTINGS_SET_DEVICE_INFO,
} from '../constants';

const initialState = {
  deviceInfo: {
    id: '12345',
    model: 'AiFöyn',
    os: '66.6',
  },
  flushToDiskInterval: 50,
  GPSInterval: 30,
  initializing: true,
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