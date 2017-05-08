import { combineReducers } from 'redux';
import ble from './bleReducer';

const rootReducer = combineReducers({
    ble
});

export default rootReducer;