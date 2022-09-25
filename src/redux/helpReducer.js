import API from '../Util/API';
import {getIdbySegment} from "../Util/WindowUtils";

const HELP_SUCCESS = 'help:HELP_SUCCESS';
const HELP_FAILURE = 'help:HELP_FAILURE';
const HELP_STARTED = 'help:HELP_STARTED';
const HELP_CLEAR = 'help:HELP_CLEAR';

const helpSuccess = (apiData, ctx) => ({
 type: HELP_SUCCESS,
 payload: apiData,
 ctx: ctx,
});

const helpStarted = () => ({
 type: HELP_STARTED
});

const helpFailure = error => ({
 type: HELP_FAILURE,
 error: error
});

export const clearHelp = error => ({
 type: HELP_CLEAR
});


export const shareUrl = (url) => {
 return dispatch => {
  dispatch(helpSuccess(url, 'share'));
 };
};

export const helpList = (url) => {
 return (dispatch, getState) => {
  var state = getState();
  if (state.help.loading === true) return false;
  dispatch(helpStarted());
  API.Get(url).then(res => {
   dispatch(helpSuccess(res.data));
  }).catch(err => {
   var msg = API.getErrorMsg(err);
   dispatch(helpFailure(msg));
  });
 };
};

export const loadFaq = (nid, ctx) => {
 return (dispatch, getState) => {
  const state = getState();
  if (state.help.loading === true) return false;
  dispatch(helpStarted());
  API.Get('/faqs/' + nid + '?v='+window.REACT_APP_VERSION_ID).then(res => {
   const msg = API.checkError(res.data);
   const tdata = getIdbySegment(document.location.pathname);
   if (msg.length > 0) {
    tdata.verb = 'false';
    dispatch(helpFailure(msg));
   } else {
    dispatch(helpSuccess({'data': [res.data], 'topics': []}, ctx)); // send as array of length 1
    tdata.verb = 'view';
   }

   tdata.dom_ref = ctx;
   tdata.nid = nid;
   if (state.auth.me && state.auth.me.profile) {
    tdata.uid = state.auth.me.profile.uid[0].value;
   }
   window.logUse.logEvent('load_faq', tdata);

  }).catch(err => {
   var msg = API.getErrorMsg(err);
   dispatch(helpFailure(msg));
  });
 };
};

export const loadUpgradePlaylistPrompt = (gc, feature, ctx) => {
 return (dispatch, getState) => {
  const state = getState();
  if (state.help.loading === true) return false;
  dispatch(helpStarted());
  API.Get('/faqs/upgrade/' + gc).then(res => {
   const msg = API.checkError(res.data);
   const tdata = getIdbySegment(document.location.pathname);
   if (msg.length > 0) {
    tdata.verb = 'false';
    dispatch(helpFailure(msg));
   } else {
    dispatch(helpSuccess({'data': [res.data], 'topics': []}, ctx)); // send as array of length 1
    tdata.verb = 'upgrade-prompt';
   }

   tdata.dom_ref = ctx;
   tdata.gc = gc;
   if (state.auth.me && state.auth.me.profile) {
    tdata.uid = state.auth.me.profile.uid[0].value;
   }
   window.logUse.logEvent('load_faq', tdata);

  }).catch(err => {
   var msg = API.getErrorMsg(err);
   dispatch(helpFailure(msg));
  });
 };
};


const initialState = {
 loading: false,
 faqs: [],
 ctx: 'page',
 url: null,
 ctas: {},
 error: null
};

export default function helpReducer(draft = initialState, action) {
 switch (action.type) {
  case HELP_STARTED:
   draft.loading = true;
   return draft;
  case HELP_CLEAR:
   draft.loading = false;
   draft.faqs = [];
   draft.ctx = 'none';
   draft.url = null;
   return draft;
  case HELP_SUCCESS:
   draft.loading = false;
   draft.error = null;
   if (action.ctx === 'share') {
    draft.url = action.payload;
    draft.ctx = action.ctx;
   } else {
    draft.faqs = action.payload;
    draft.ctx = action.ctx ? action.ctx : 'page';
   }
   return draft;
  case HELP_FAILURE:
   draft.loading = false;
   draft.error = action.error;
   return draft;
  default:
   return draft;
 }
}
