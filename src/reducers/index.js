import { combineReducers } from 'redux';
import ble from './bleReducer';
import settings from './settingsReducer';
import filesystem from './filesystemReducer';

const rootReducer = combineReducers({
    ble,
    settings,
    filesystem,
});

export default rootReducer;