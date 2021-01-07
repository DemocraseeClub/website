import {getIdbySegment} from "./authActions";

export const LOGIN_STARTED = 'LOGIN_STARTED' // for modals / navigation
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS' //
export const LOGIN_FAILURE = 'LOGIN_FAILURE'

export const SIGNUP_STARTED = 'SIGNUP_STARTED'
export const SIGNUP_SUCCESS = 'SIGNUP_SUCCESS' // an opportunity for the client to route what's next
export const SIGNUP_FAILURE = 'SIGNUP_FAILURE'

export const VERIFY_STARTED = 'VERIFY_STARTED'
export const VERIFY_SUCCESS = 'VERIFY_SUCCESS' // an opportunity for the client to route what's next
export const VERIFY_FAILURE = 'VERIFY_FAILURE'

export const GROUP_CHANGED = 'GROUP_CHANGED';
export const LOG_OUT = 'LOG_OUT' // generally async anyway (client kills token, doesn't need callback for revoking on server)

export const SET_MENU_VISIBILITY = 'menu:SET_MENU_VISIBILITY';
export const SET_MENU_GROUP = 'menu:SET_MENU_GROUP';

// default authentication object
const initialState = {
  me: false,
  loading: false,
  isMenuOpen : false,
  curGroup : 0,
  signUpError: false,
  verifyError: false,
  logInError: false
}


const authReducer = (draft = initialState, action) => {
  draft.loading = false; // default except when started
  switch(action.type) {

    case LOGIN_STARTED:
      draft.logInError = false;
      draft.loading = true;
      return draft;
    case LOGIN_SUCCESS:
      draft.logInError = false;
      if (action.me.profile || action.me.menu || action.me.groups) {
          draft.me = action.me;
          if (draft.curGroup === 0) {
              let gid = getIdbySegment(document.location.pathname).gid
              if (gid > 0) {
                  draft.curGroup = gid;
              }
          }
      } else if (action.access_token) {
        // already stored
      }
      return draft;
    case LOGIN_FAILURE:
      draft.logInError = action.error;
      return draft;
    case SIGNUP_STARTED:
      draft.signUpError = false;
      return draft;
      case GROUP_CHANGED:
          if (action.groups) {
              let g = action.gid;
              if (typeof draft.me.groups !== 'object') draft.me.groups = {};
              for(g in action.groups) {
                  draft.me.groups[g] = action.groups[g];
              }
              if (action.groups[g]) {
                  console.log("CHANGING GID : " + g);
                  draft.curGroup = parseInt(g);
                  window.gFeatures = JSON.parse(action.groups[g].field_features[0].value);
                  window.gGrammer = JSON.parse(action.groups[g].field_grammer[0].value);
                  // potentially overwrite draft.me.menu and apiversion ??
              }
          }
      return draft;
    case SIGNUP_SUCCESS:
      draft.signUpError = false; // handles joinGroup and leaveGroup
      if (action.me.profile || action.me.menu || action.me.groups) {
        draft.me = action.me; // subsequent login works better
      }
      return draft;
    case SIGNUP_FAILURE:
      draft.signUpError = action.error;
      return draft;
    case VERIFY_STARTED:
      draft.verifyError = false;
      return draft;
    case VERIFY_SUCCESS:
      draft.verifyError = false;
      if (action.me.profile) {
        draft.me = action.me;
      }
      return draft;
    case VERIFY_FAILURE:
      draft.verifyError = action.error;
      return draft;
    case SET_MENU_VISIBILITY:
      if (action.payload === 'close') {
        draft.isMenuOpen = false;
      } else if (action.payload === 'open') {
        draft.isMenuOpen = true;
      } else {
        draft.isMenuOpen = !draft.isMenuOpen;
      }
      return draft;
    case SET_MENU_GROUP:
      if (draft.me.groups && typeof draft.me.groups[action.group.id[0].value] !== 'undefined') { // is a member
        draft.me.groups[action.group.id[0].value] = Object.assign(draft.me.groups[action.group.id[0].value], action.group);
         // keeps membership // other startup props && adds stats /...
      }
      return draft;
    case LOG_OUT:
      return {...initialState}
    default:
      return draft

  }
}

export default authReducer;
