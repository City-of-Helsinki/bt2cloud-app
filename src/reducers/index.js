import { combineReducers } from 'redux';
import ble from './bleReducer';
import settings from './settingsReducer';
import filesystem from './filesystemReducer';
import notification from './notificationReducer';
import activeView from './viewReducer';

const rootReducer = combineReducers({
    ble,
    settings,
    filesystem,
    notification,
    activeView,
});

export default rootReducer;