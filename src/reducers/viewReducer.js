// keeps track of active view

import { ACTIVE_VIEW_CHANGED } from '../constants';

const initialState = {
  activeView: null,
};

export default function viewReducer (state = initialState, action) {
  switch (action.type) {
    case ACTIVE_VIEW_CHANGED:
    console.log(action.activeView);
    	return {
        ...state,
        activeView: action.activeView,
    	};

    default:
      return state;
  }
};