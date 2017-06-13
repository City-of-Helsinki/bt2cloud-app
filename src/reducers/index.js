import { combineReducers } from 'redux';
import ble from './bleReducer';
import settings from './settingsReducer';
import filesystem from './filesystemReducer';
import notification from './notificationReducer';

const rootReducer = combineReducers({
    ble,
    settings,
    filesystem,
    notification,
});

export default rootReducer;