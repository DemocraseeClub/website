export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const SIGNUP_SUCCESS = "SIGNUP_SUCCESS";
export const VERIFY_SUCCESS = "VERIFY_SUCCESS"; // an opportunity for the client to route what's next
export const LOG_OUT = "LOG_OUT"; // generally async anyway (client kills token, doesn't need callback for revoking on server)
export const SET_THEME_COLORS = "SET_THEME_COLORS";


export function setThemeMode(mode) {
  return {
    type: SET_THEME_COLORS,
    mode: mode
  };
}

export function signUpSuccess(user) {
  return {
    type: SIGNUP_SUCCESS,
    me: user,
  };
}

export function logInSuccess(payload) {
  return {
    type: LOGIN_SUCCESS,
    me: payload,
  };
}

export function verifyEmailSuccess(payload) {
  return {
    type: VERIFY_SUCCESS,
    me: payload,
  };
}

let lightMode = {
  spacing: 4,
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
      contrastText:"#fbffff"
    },
    background: {
      default: "#ffffff",
      paper: "#fbffff",
      contrastText:"#202020"
    },
  },
   overrides: {
    MuiPaper : {
      root : {
        color:'#000'
      }
    },
    MuiBox : {
      root : {
        color:'#000'
      }
    }
  }
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
      contrastText:"#fbffff"
    },
    background: {
      default: "#002e36",
      paper: "#132f36",
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

const initialState = {
  me: false,
  siteTheme: darkMode, // process.env.NODE_ENV === "development" ? darkMode : lightMode,
};

const authReducer = (draft = initialState, action) => {
  draft.loading = false; // default except when started
  switch (action.type) {
    case LOGIN_SUCCESS:
      draft.me = action.me;
      return draft;
    case SIGNUP_SUCCESS:
      draft.me = action.me;
      return draft;
    case VERIFY_SUCCESS:
      draft.me = action.me;
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
