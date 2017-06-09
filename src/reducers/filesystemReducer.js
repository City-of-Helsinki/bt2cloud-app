import Utils from '../utils/utils';
import realm from '../realm';
import { 
  FILESYSTEM_WRITING,
  FILESYSTEM_WRITING_DONE,
  FILESYSTEM_UPLOADING,
  FILESYSTEM_UPLOADING_DONE,
} from '../constants';

const initialState = {
  writing: false,
  uploading: false,
};

export default function filesystemReducer (state = initialState, action) {
  switch (action.type) {

    case FILESYSTEM_WRITING:
    return {
      ...state,
      writing: true,
    };
    case FILESYSTEM_WRITING_DONE:
    return {
      ...state,
      writing: false,
    }; 
    case FILESYSTEM_UPLOADING:
    return {
      ...state,
      uploading: true,
    };
    case FILESYSTEM_UPLOADING_DONE:
    return {
      ...state,
      uploading: false,
    };          
    default:
      return state;
  }
};