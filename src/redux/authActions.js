import API from '../Util/API';
import Config from '../Config';
import {push} from 'connected-react-router'
import {_showNotice} from './formsReducer';
import {setWalletBalance} from './walletReducer';
import {getParam} from '../Util/WindowUtils';

import {
    LOGIN_STARTED,
    LOGIN_SUCCESS,
    LOGIN_FAILURE,

    SIGNUP_STARTED,
    SIGNUP_SUCCESS,
    SIGNUP_FAILURE,

    SET_MENU_VISIBILITY,

    GROUP_CHANGED

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

export function toggleMenu(force) {
    return {
        type: SET_MENU_VISIBILITY,
        payload: force
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

export function changeApp(gid) {
    return dispatch => {
        API.Get('/appstartup/menu/'+gid).then((res) => {
            return dispatch({
                type: GROUP_CHANGED,
                gid: gid,
                ...res.data,
            });
        });
    };
}

export function getIdbySegment(url) {
    const tdata = {};
    let parts = url.split('/');
    Object.entries(segmentMap).forEach(([segName, param]) => {
        let index = parts.indexOf(segName);
        if (index > 0 && parseInt(parts[index + 1]) > 0) {
            tdata[param] = parseInt(parts[index+1]);
        }
    });
    return tdata;
}

const redirectLogin = function () {
    var segs = document.location.pathname.split('/');
    if (segs.length > 1) {
        if (segs[1] !== 'info' &&
            segs[1] !== 'marketplace' &&
            segs[1] !== 'groups' &&
            (segs[1] === 'group' && segs.length !== 3) &&
            segs[1] !== 'login' &&
            segs[1] !== 'otp' &&
            segs[1] !== 'register') {
            document.location.href = '/login';
        }
    }
}

export function deleteGroup(gid) {
    return dispatch => {
        dispatch(signUpStart());
        const apiurl = "/forms/group/" + gid + "/delete";
        API.Delete(apiurl).then((res) => {
            var msg = API.checkError(res.data);
            if (msg.length > 0) {
                dispatch(signUpFailure(msg))
            } else {
                if (res.data.success) dispatch(_showNotice(res.data.success));
                dispatch(signUpSuccess(res.data));
                dispatch(initApp(apiurl, 'group-deleted'));
                dispatch(push('/groups'));
            }
        }).catch((err) => {
            var msg = API.getErrorMsg(err);
            console.log('token check error: ', msg)
            dispatch(signUpFailure(msg))
            return err;
        });
    }
}

export function joinGroup(gid) {
    return dispatch => {
        dispatch(signUpStart());
        const apiurl = "/forms/group/" + gid + "/members/add";
        API.Post(apiurl).then((res) => {
            var msg = API.checkError(res.data);
            if (msg.length > 0) {
                dispatch(signUpFailure(msg))
            } else {
                if (res.data.success) dispatch(_showNotice(res.data.success));
                dispatch(signUpSuccess(res.data));
                dispatch(initApp(apiurl, 'group-joined'));
                dispatch(push('/group/' + gid));
            }
        }).catch((err) => {
            var msg = API.getErrorMsg(err);
            console.log('token check error: ', msg)
            dispatch(signUpFailure(msg))
            return err;
        });
    }
}

export function leaveGroup(gid, uid) {
    return dispatch => {
        dispatch(signUpStart());

        const apiurl = "/forms/group/" + gid + "/members/" + uid + "/delete";
        API.Delete(apiurl).then((res) => {
            var msg = API.checkError(res.data);
            if (msg.length > 0) {
                dispatch(signUpFailure(res.data.error))
            } else {
                if (res.data.success) dispatch(_showNotice(res.data.success));
                dispatch(signUpSuccess(res.data));
                dispatch(initApp(apiurl, 'group-left'));
                dispatch(push('/group/' + gid));
            }
        }).catch((err) => {
            var msg = API.getErrorMsg(err);
            console.log('token check error: ', msg)
            dispatch(signUpFailure(msg))
            return err;
        });
    }
}


export function otpLogin() {
    return dispatch => {
        const apiurl = document.location.pathname + document.location.search;
        API.Get(apiurl).then((res) => {
            console.log(res.data);
            var msg = API.checkError(res.data), dest = '/login';
            if (msg.length > 0) {
                dispatch(initApp(apiurl, 'otp-login-failed'));
            } else if (res.data.access_token) {
                if (res.data.randpass) msg = 'Your new random password is ' + res.data.randpass;
                delete res.data.randpass;

                res.data.created_time = (res.data.apiversion) ? res.data.apiversion : Math.floor(new Date().getTime() / 1000);
                localStorage.setItem(Config.api.tokName, JSON.stringify(res.data));
                localStorage.setItem(Config.api.tokName + '_apiversion', res.data.created_time);

                dest = getParam('q', document.location.search, '/');
                dispatch(initApp(apiurl, 'otp-login'));
            } else if (res.data.randpass) {
                dispatch(getToken(res.data.email, res.data.randpass));
                msg = 'Your new password is ' + res.data.randpass;
                dest = getParam('q', document.location.search, '/');
            } else {
                dispatch(initApp(apiurl, 'otp-login-failed'));
                msg = 'There was an issue with your one time password. Please try again';
            }
            dispatch(push(dest));
            if (msg.length > 0) dispatch(_showNotice(msg, 'error'));

        }).catch((err) => {
            var msg = API.getErrorMsg(err);
            dispatch(_showNotice(msg));
            dispatch(initApp(apiurl, 'otp-login-failed'));
            dispatch(push('/login?error=otpfailed'));
        });
    };
}

export function initApp(apiurl, verb) {
    const tdata = getIdbySegment(apiurl);
    tdata.verb = verb;
    tdata.webwersion = window.REACT_APP_VERSION_ID;

    return (dispatch, getState) => {
        let initurl = `/appstartup?windowWidth=${window.innerWidth}&windowHeight=${window.innerHeight}`;

        if (!tdata.gid) tdata.gid = getState().auth.curGroup;
        if (tdata.gid) initurl += `&gid=${tdata.gid}`;

        API.Get(initurl).then((res) => {

            res.data.created_time = (res.data.apiversion) ? res.data.apiversion : Math.floor(new Date().getTime() / 1000);
            localStorage.setItem(Config.api.tokName + '_apiversion', res.data.created_time);

            if (res.data.profile && res.data.profile.wallet && res.data.profile.wallet) {
                dispatch(setWalletBalance(res.data.profile.wallet));
            }

            if (!tdata.gid && res.data.brandId) tdata.gid = res.data.brandId;

            if (res.data.profile && !res.data.brandId && tdata.gid > 0 && typeof res.data.groups[tdata.gid] === 'undefined') {
                dispatch(joinGroup(tdata.gid));
            } else {
                if (res.data.groups && tdata.gid > 0 && res.data.groups[tdata.gid] && res.data.groups[tdata.gid].field_features) {
                    if (res.data.groups[tdata.gid].field_features.length > 0) window.gFeatures = JSON.parse(res.data.groups[tdata.gid].field_features[0].value);
                    if (res.data.groups[tdata.gid].field_grammer.length > 0) window.gGrammer = JSON.parse(res.data.groups[tdata.gid].field_grammer[0].value);
                } else if (res.data.groups && res.data.brandId > 0 && res.data.groups[res.data.brandId] && res.data.groups[res.data.brandId].field_features) {
                    if (res.data.groups[res.data.brandId].field_features.length > 0) window.gFeatures = JSON.parse(res.data.groups[res.data.brandId].field_features[0].value);
                    if (res.data.groups[res.data.brandId].field_grammer.length > 0) window.gGrammer = JSON.parse(res.data.groups[res.data.brandId].field_grammer[0].value);
                }
            }

            dispatch(logInSuccess(res.data)); // misnomer since failed login still returns array('menu'=>[])

            tdata.apiversion = res.data.apiversion;
            if (res.data.profile && res.data.profile.uid) {
                tdata.uid = res.data.profile.uid[0].value;
                if (res.data.brandId) {
                    window.logUse.setUserProperties({uid: tdata.uid, brandId:res.data.brandId});
                } else {
                    window.logUse.setUserProperties({uid: tdata.uid});
                }
            }

            let tokens = API.getLocalTokens();
            if (tokens && !res.data.profile) {
                tdata.verb = 'expired';
                dispatch(logInFailure('Your session expired. Please <a href="/login">login</a> again'));
                redirectLogin();
            } else {
                if (tokens) tdata.verb = 'return';
                else tdata.verb = 'visit';
            }
            window.logUse.logEvent('init', tdata);
        }).catch((err) => {
            var msg = API.getErrorMsg(err);
            console.log('appstartup error: ', msg)
            dispatch(logInFailure(msg))
            if (API.getLocalTokens()) {
                localStorage.removeItem(Config.api.tokName);
                document.location.href = '/login';
            }
            tdata.verb = 'startup-failed';
            window.logUse.logEvent('init', tdata);
            return err;
        });
    };
}

export function getToken(user_email, password, scope) {
    return dispatch => {

        dispatch(logInStart());

        var formData = new FormData();
        formData.append('grant_type', 'password');
        formData.append('client_id', Config.api.client_id);
        formData.append('client_secret', Config.api.client_secret);
        formData.append('username', user_email);
        formData.append('password', password);
        if (scope) {
            formData.append('scope', scope);
        } else {
            //  formData.append('scope', 'authenticated administrator verified_cc verified_fb verified_email ui_developer');
        }

        var req = {
            url: "/oauth/token",
            method: "POST",
            headers: {
//             'Content-Type': 'application/x-www-form-urlencoded'
                'Content-Type': `multipart/form-data; boundary=` + formData._boundary,
            },
            data: formData,
        }
        const tdata = getIdbySegment(document.location.pathname);
        tdata.value = user_email;
        API.Request(req).then((res) => {
            var msg = API.checkError(res.data);
            if (msg.length > 0) {
                dispatch(logInFailure(msg));
                tdata.verb = 'login-failed';
                window.logUse.logEvent('init', tdata);
            } else {
                res.data.created_time = (res.data.apiversion) ? res.data.apiversion : Math.floor(new Date().getTime() / 1000);
                localStorage.setItem(Config.api.tokName, JSON.stringify(res.data));
                localStorage.setItem(Config.api.tokName + '_apiversion', res.data.created_time);
                var dest = getParam('q', document.location.search, '/');
                dispatch(logInSuccess(res.data));
                dispatch(push(dest));
                dispatch(initApp('/oauth/token', 'login'));
            }
        }).catch((err) => {
            var msg = API.getErrorMsg(err);
            console.log('tokencheck error: ', msg);
            dispatch(logInFailure(msg));
            tdata.verb = 'login-failed';
            window.logUse.logEvent('init', tdata);
            return err;
        });
    };
}

export function registerForm(email, password, gids, coupon) {
    return dispatch => {

        dispatch(signUpStart())

        var obj = {
            email: email,
            gids: gids.split(',')
        }

        const tdata = getIdbySegment(document.location.pathname);

        if (coupon && coupon.length > 0) {
            obj.coupon = coupon;
            tdata.coupon = coupon;
        }

        if (password === '') {
            const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            while (password.length < 10) password += alphabet.charAt(Math.floor(Math.random() * alphabet.length)); // maybe store to autologin on success
            obj.isRandom = true;
        }

        obj.password = password;

        tdata.value = email;
        tdata.gids = gids;
        API.Post("/forms/users/add", obj).then((res) => {
            if (typeof res.data.error !== 'undefined') {
                dispatch(signUpFailure(res.data.error));
                tdata.verb = 'register-failed';
            } else {
                tdata.verb = 'registered';
                window.logUse.logEvent('init', tdata);
                dispatch(signUpSuccess(res.data));
                dispatch(getToken(email, password));
            }
            window.logUse.logEvent('init', tdata);
        }).catch((err) => {
            var msg = API.getErrorMsg(err);
            console.log('token check error: ', msg)
            dispatch(signUpFailure(msg))
            tdata.verb = 'register-failed';
            window.logUse.logEvent('init', tdata);
            return err;
        });
    };
}
