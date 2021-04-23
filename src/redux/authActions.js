import {
    LOGIN_FAILURE,
    LOGIN_STARTED,
    LOGIN_SUCCESS,
    SET_THEME_COLORS,
    SIGNUP_FAILURE,
    SIGNUP_STARTED,
    SIGNUP_SUCCESS
} from './authReducer'

function logInStart() {
    return {
        type: LOGIN_STARTED
    }
}

function logInSuccess(payload) {
    return {
        type: LOGIN_SUCCESS,
        me: payload
    }
}

function logInFailure(err) {
    return {
        type: LOGIN_FAILURE,
        error: err
    }
}

function signUpStart() {
    return {
        type: SIGNUP_STARTED
    }
}

function signUpSuccess(user) {
    return {
        type: SIGNUP_SUCCESS,
        me: user
    }
}

function signUpFailure(err) {
    return {
        type: SIGNUP_FAILURE,
        error: err
    }
}

export function setThemeMode(mode) {
    return {
        type: SET_THEME_COLORS,
        mode: mode
    };
}

const segmentMap = { // expects /group/9/playlists/8321/tracks/8483/edit
    'rally':'rid',
    'users':'aid',
    'members':'uid',
    'tracks':'tid',
    'comments':'cid',
    'faqs':'nid'
};
