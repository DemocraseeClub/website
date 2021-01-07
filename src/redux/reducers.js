import { combineReducers } from 'redux-immer';
import producer from 'immer';
import { connectRouter } from 'connected-react-router'
import entityDataReducer from './entityDataReducer';
import authReducer from './authReducer';

/*
import emailReducer from './emailReducer';
import listDataReducer from './listDataReducer';
import formsReducer from './formsReducer';
import playerReducer from './playerReducer';
import helpReducer from './helpReducer';
import walletReducer from './walletReducer';
import commentsReducer from "./commentsReducer";
*/

export default (history) => combineReducers(producer, {
  'auth': authReducer,
  // 'lists': listDataReducer,
  // 'emails': emailReducer,
  'entity': entityDataReducer,
  // 'player':playerReducer,
  // 'help':helpReducer,
  // 'forms':formsReducer,
  // 'comments':commentsReducer,
  // 'wallet':walletReducer,
  'router': connectRouter(history),
})

// export default rootReducer;
