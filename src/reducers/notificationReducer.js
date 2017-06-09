// this is simply a quite non-elegant solution for performance...
// char notifications should only re-render device detail view component
import { 
  BLE_APPEND_READ_HISTORY
} from '../constants';

const initialState = {
  readHistory: null,
};

export default function notificationReducer (state = initialState, action) {
  switch (action.type) {

    case BLE_APPEND_READ_HISTORY:
    return {
      readHistory: [],
      ...state,
    };

    default:
      return state;
  }
};