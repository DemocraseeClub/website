import API from '../Util/API';
import {push} from 'connected-react-router';
import {_showNotice} from './formsReducer';
//import { getParam } from '../Util/WindowUtils';

export const EMAIL_LIST = 'EMAIL_LIST';
export const EMAIL_STARTED = 'EMAIL_STARTED';
export const EMAIL_UPDATED = 'EMAIL_UPDATED';
export const EMAIL_FAILURE = 'EMAIL_FAILURE';

const initialState = {
  loading:false,
  updating:false,
  error : null,
  apiData: false,
}

const emailReducer = (draft = initialState, action) => {
  switch(action.type) {

    case EMAIL_STARTED:
      if (action.method === 'GET') {
        draft.loading = true;
      } else {
        draft.updating = true;
      }
      return draft;
    case EMAIL_UPDATED:
      for(var i in draft.apiData.data) {
        if (draft.apiData.data[i].email.eid === action.eid) {
          draft.apiData.data[i].email.status = action.status;
        }
      }
      draft.updating = false;
      return draft;
    case EMAIL_LIST:
      draft.loading = false;
      draft.updating = false;
      draft.error = null;
      draft.apiData = action.payload;
      return draft;
    default:
      return draft
  }
}

export default emailReducer;

function emailStart(method) {
  return {
    type: EMAIL_STARTED,
    method : method
  }
}

function emailSuccess(eid, status) {
  return {
    type: EMAIL_UPDATED,
    eid:eid,
    status:status
  }
}

function emailList(apiData) {
  return {
    type: EMAIL_LIST,
    payload: apiData
  }
};


export const listEmails = (url) => {
  return (dispatch, getState) => {
    var state = getState();
    if (state.emails.loading === true) return false;

    dispatch(emailStart('GET'));

    API.Get(url).then(res => {
      dispatch(emailList(res.data));
    }).catch(err => {
      var msg = API.getErrorMsg(err);
      console.log('token check error: ', msg)
      dispatch(_showNotice(msg, 'error'))
      return err;
    });
  };
};


export function deleteEmail(eid) {
  return dispatch => {
    dispatch(emailStart('DELETE'));

    API.Delete("/emails/"+eid+"/delete").then((res) => {
      const msg = API.checkError(res.data);
      if (msg.length > 0) {
          dispatch(_showNotice(msg, 'error'))
        } else {
          if (res.data.success) dispatch(_showNotice(res.data.success));
          dispatch(emailSuccess(eid, 'deleted'));
        }
    }).catch((err) => {
        var msg = API.getErrorMsg(err);
        console.log('token check error: ', msg)
        dispatch(_showNotice(msg, 'error'))
        return err;
    });
  }
}

export function resendEmail(eid) {
  return dispatch => {
    dispatch(emailStart('PUT'));

    API.Put("/emails/"+eid+"/resend").then((res) => {
      const msg = API.checkError(res.data);
      if (msg.length > 0) {
          dispatch(_showNotice(msg, 'error'))
        } else {
          if (res.data.success) dispatch(_showNotice(res.data.success));
          dispatch(emailSuccess(eid, 'resend'));
        }
    }).catch((err) => {
        var msg = API.getErrorMsg(err);
        console.log('token check error: ', msg)
        dispatch(_showNotice(msg, 'error'))
        return err;
    });
  }
}

export function sendInvites(gid, fields) {
  return dispatch => {
    dispatch(emailStart('POST'));
    API.Post("/forms/group/"+gid+"/invites", fields).then((res) => {
      var msg = API.checkError(res.data);
      if (msg.length > 0) {
          dispatch(_showNotice(msg, 'error'))
        } else {
          if (res.data.success) dispatch(_showNotice(res.data.success));
          const keys = ['sent','dup','members','failed','rejected'];
          for(var k in keys) {
            if (typeof res.data[keys[k]] !== 'undefined' && res.data[keys[k]].length > 0) {
              msg = keys[k] + ': ' + res.data[keys[k]].join(',');
              dispatch(_showNotice(msg, 'error'));
            }
          }
          push('/group/'+gid+'/emails');
        }
    }).catch((err) => {
        var msg = API.getErrorMsg(err);
        console.log('token check error: ', msg)
        dispatch(_showNotice(msg, 'error'))
        return err;
    });
  }
}
