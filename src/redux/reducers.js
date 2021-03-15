import { combineReducers } from 'redux-immer';
import producer from 'immer';
import { connectRouter } from 'connected-react-router'
import entityDataReducer from './entityDataReducer';
import authReducer from './authReducer';

export default (history) => combineReducers(producer, {
  'auth': authReducer,
  'entity': entityDataReducer,
  'router': connectRouter(history),
})

// export default rootReducer;
