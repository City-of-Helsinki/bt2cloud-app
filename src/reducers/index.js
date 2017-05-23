import { combineReducers } from 'redux';
import ble from './bleReducer';
import settings from './settingsReducer';

const rootReducer = combineReducers({
    ble,
    settings,
});

export default rootReducer;