import {combineReducers} from 'redux-immer';
import producer from 'immer';
import {connectRouter} from 'connected-react-router'
import progressReducer from "./progressReducer";
import emailReducer from './emailReducer';
import authReducer from './authReducer';
import listDataReducer from './listDataReducer';
import formsReducer from './formsReducer';
import entityDataReducer from './entityDataReducer';
import helpReducer from './helpReducer';
import walletReducer from './walletReducer';
import commentsReducer from "./commentsReducer";

export default (history) => combineReducers(producer, {
  'auth': authReducer,
  'lists': listDataReducer,
  'emails': emailReducer,
  'entity': entityDataReducer,
  'help':helpReducer,
  'forms':formsReducer,
  'comments':commentsReducer,
  'wallet':walletReducer,
  'progress': progressReducer,
  'router': connectRouter(history),
})

// export default rootReducer;
