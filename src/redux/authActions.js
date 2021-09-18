import {push} from "connected-react-router";
import {getParam, getIdbySegment} from "../Util/WindowUtils";
import {setLoader, addNotice} from "./progressReducer";
import Config from '../Config';
import API from "../Util/API";
import {signUpSuccess, logInSuccess} from "./authReducer";

export function getToken(user_email, password, scope) {
    return (dispatch) => {
        dispatch(setLoader('signin', true));

        const formData = new FormData();
        formData.append("grant_type", "password");
        formData.append("client_id", Config.api.client_id);
        formData.append("client_secret", Config.api.client_secret);
        formData.append("username", user_email);
        formData.append("password", password);
        if (scope) {
            formData.append("scope", scope);
        } else {
            //  formData.append('scope', 'authenticated administrator verified_cc verified_fb verified_email ui_developer');
        }

        const tdata = getIdbySegment(document.location.pathname);
        API.Request({
            url: "/oauth/token",
            method: "POST",
            headers: {
                //             'Content-Type': 'application/x-www-form-urlencoded'
                "Content-Type": `multipart/form-data; boundary=` + formData._boundary,
            },
            data: formData,
            })
            .then((res) => {
                var msg = API.checkError(res.data);
                if (msg.length > 0) {
                    dispatch(addNotice(msg));
                    tdata.verb = "login-failed";
                    window.logUse.logEvent("init", tdata);
                } else {
                    res.data.created_time = res.data.apiversion
                        ? res.data.apiversion
                        : Math.floor(new Date().getTime() / 1000);
                    localStorage.setItem(Config.api.tokName, JSON.stringify(res.data));
                    localStorage.setItem(Config.api.tokName + "_apiversion", res.data.created_time);

                    dispatch(logInSuccess(res.data));
                    const dest = getParam("q", document.location.search, "/");
                    dispatch(push(dest));
                }
            })
            .catch((err) => {
                var msg = API.getErrorMsg(err);
                console.warn("token error: ", msg);
                dispatch(addNotice(msg));
                tdata.verb = "login-failed";
                window.logUse.logEvent("init", tdata);
                return err;
            });
    };
}


export function registerAccount(email, password) {
    return (dispatch) => {
        dispatch(setLoader('signup', true));

        var obj = {email: email};

        const tdata = getIdbySegment(document.location.pathname);

        if (password === "") {
            const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#-_0123456789";
            while (password.length < 10)
                password += alphabet.charAt(
                    Math.floor(Math.random() * alphabet.length)
                ); // maybe store to autologin on success
            obj.isRandom = true;
        }

        obj.password = password;

        tdata.value = email;
        API.Post("/users/add", obj)
            .then((res) => {
                if (typeof res.data.error !== "undefined") {
                    dispatch(addNotice(res.data.error));
                    tdata.verb = "register-failed";
                } else {
                    tdata.verb = "registered";
                    window.logUse.logEvent("init", tdata);
                    dispatch(signUpSuccess(res.data));
                    dispatch(getToken(email, password));
                }
                window.logUse.logEvent("init", tdata);
            })
            .catch((err) => {
                var msg = API.getErrorMsg(err);
                console.log("token check error: ", msg);
                dispatch(addNotice(msg));
                tdata.verb = "register-failed";
                window.logUse.logEvent("init", tdata);
                return err;
            });
    };
}



export function otpLogin() {
    return (dispatch) => {
        const apiurl = document.location.pathname + document.location.search;
        API.Get(apiurl)
            .then((res) => {
                var msg = API.checkError(res.data),
                    dest = "/login";
                if (msg.length > 0) {
                    dispatch(addNotice(msg));
                } else if (res.data.access_token) {
                    if (res.data.randpass)
                        msg = "Your new random password is " + res.data.randpass;
                    delete res.data.randpass;

                    res.data.created_time = res.data.apiversion
                        ? res.data.apiversion
                        : Math.floor(new Date().getTime() / 1000);
                    localStorage.setItem(Config.api.tokName, JSON.stringify(res.data));
                    localStorage.setItem(
                        Config.api.tokName + "_apiversion",
                        res.data.created_time
                    );

                    dest = getParam("q", document.location.search, "/");
                } else if (res.data.randpass) {
                    dispatch(getToken(res.data.email, res.data.randpass));
                    msg = "Your new password is " + res.data.randpass;
                    dest = getParam("q", document.location.search, "/");
                } else {
                    msg = "There was an issue with your one time password. Please try again";
                }
                dispatch(push(dest));
                if (msg.length > 0) dispatch(addNotice(msg, "error"));
            })
            .catch((err) => {
                var msg = API.getErrorMsg(err);
                dispatch(addNotice(msg));
                dispatch(push("/login?error=otpfailed"));
            });
    };
}
