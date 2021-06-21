export const LOGIN_STARTED = "LOGIN_STARTED"; // for modals / navigation
export const LOGIN_SUCCESS = "LOGIN_SUCCESS"; //
export const LOGIN_FAILURE = "LOGIN_FAILURE";

export const SIGNUP_STARTED = "SIGNUP_STARTED";
export const SIGNUP_SUCCESS = "SIGNUP_SUCCESS"; // an opportunity for the client to route what's next
export const SIGNUP_FAILURE = "SIGNUP_FAILURE";

export const VERIFY_STARTED = "VERIFY_STARTED";
export const VERIFY_SUCCESS = "VERIFY_SUCCESS"; // an opportunity for the client to route what's next
export const VERIFY_FAILURE = "VERIFY_FAILURE";

export const LOG_OUT = "LOG_OUT"; // generally async anyway (client kills token, doesn't need callback for revoking on server)

export const SET_THEME_COLORS = "SET_THEME_COLORS";

let lightMode = {
  palette: {
    type: "light",
    primary: {
      main: "#095760",
      contrastText: "#C1D5D7",
    },
    secondary: {
      main: "#B9DFF4",
      contrastText: "#002866",
    },
    info: {
      main: "#005ea2",
      contrastText: "#ffffff",
    },
    error: {
      main: "#D83933",
    },
    background: {
      default: "#ffffff",
      paper: "#fbffff",
    },
  },
};

let darkMode = {
  palette: {
    type: "dark",
    primary: {
      main: "#1194A3",
      contrastText: "#C1D5D7",
    },
    secondary: {
      main: "#B9DFF4",
      contrastText: "#04709a",
    },
    info: {
      main: "#005ea2",
      contrastText: "#ffffff",
    },
    error: {
      main: "#D83933",
    },
    background: {
      default: "#002e36",
      paper: "#035353",
      contrastText: "#d0dce0",
    },
  },
  overrides: {
    MuiPaper : {
      root : {
        color:'#fff'
      }
    },
    MuiBox : {
      root : {
        color:'#fff'
      }
    }
  }
};

//#1B3033#264347
const initialState = {
  me: false,
  siteTheme: process.env.NODE_ENV === "development" ? darkMode : lightMode,
  loading: false,
  signUpError: false,
  verifyError: false,
  logInError: false,
};

const authReducer = (draft = initialState, action) => {
  draft.loading = false; // default except when started
  switch (action.type) {
    case LOGIN_STARTED:
      draft.logInError = false;
      draft.loading = true;
      return draft;
    case LOGIN_SUCCESS:
      draft.logInError = false;
      draft.me = action.me;
      return draft;
    case LOGIN_FAILURE:
      draft.logInError = action.error;
      return draft;
    case SIGNUP_STARTED:
      draft.signUpError = false;
      return draft;
    case SIGNUP_SUCCESS:
      draft.signUpError = false;
      draft.me = action.me;
      return draft;
    case SIGNUP_FAILURE:
      draft.signUpError = action.error;
      return draft;
    case VERIFY_STARTED:
      draft.verifyError = false;
      return draft;
    case VERIFY_SUCCESS:
      draft.verifyError = false;
      draft.me = action.me;
      return draft;
    case VERIFY_FAILURE:
      draft.verifyError = action.error;
      return draft;
    case SET_THEME_COLORS:
      if (action.mode === "dark") {
        draft.siteTheme = darkMode;
      } else {
        draft.siteTheme = lightMode;
      }
      return draft;
    case LOG_OUT:
      return { ...initialState };
    default:
      return draft;
  }
};

export default authReducer;
