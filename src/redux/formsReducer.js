import API from '../Util/API';
import {push} from 'connected-react-router';
import {requestDeposit} from './walletReducer';
import {getIdbySegment, initApp} from './authActions';
import {getParam} from '../Util/WindowUtils';
import {updateListTrack} from "./listDataReducer";
import {updatePlayerTrack} from "./playerReducer";
import {entityDataSuccess} from "./entityDataReducer";

const FORM_DATA_CANCEL = 'forms:FORM_DATA_CANCEL';
const FORM_DATA_SUCCESS = 'forms:FORM_DATA_SUCCESS';
const FORM_DATA_FAILURE = 'forms:FORM_DATA_FAILURE';
const FORM_DATA_STARTED = 'forms:FORM_DATA_STARTED';
const FORM_DATA_COMPLETED = 'forms:FORM_DATA_COMPLETED';

const FORM_UPLOAD_STARTED = 'forms:FORM_UPLOAD_STARTED';
const FORM_UPLOAD_COMPLETED = 'forms:FORM_UPLOAD_COMPLETED';
const FORM_MEDIA_ADD = 'forms:FORM_MEDIA_ADD'; // just adds the item to the MediaForm table before form submission
const FORM_MEDIA_DELETE = 'forms:FORM_MEDIA_DELETE'; // just adds the item to the MediaForm table before form submission

const FORM_POPULATE_TRACK = 'forms:FORM_POPULATE_TRACK';
const FORM_POPULATE_PLAYLIST = 'forms:FORM_POPULATE_PLAYLIST';
const FORM_POPULATE_REWARD = 'forms:FORM_POPULATE_REWARD';
const FORM_NOTICE = 'forms:FORM_NOTICE';
const FORM_ADD_WIDGET = 'forms:FORM_ADD_WIDGET';
const FORM_REMOVE_WIDGET = 'forms:FORM_REMOVE_WIDGET';
const THEME_UPDATE = 'forms:THEME_UPDATE';
const FORM_CLEAR_ERROR = 'forms:FORM_CLEAR_ERROR';
const FORM_SET_FIELD_VALUE = 'forms:FORM_SET_FIELD_VALUE';

const formsSuccess = (api, apiurl) => ({
    type: FORM_DATA_SUCCESS,
    payload: api,
    apiurl: apiurl
});

const formsStarted = (apiurl, ctx) => ({
    type: FORM_DATA_STARTED,
    ctx: ctx,
    apiurl: apiurl
});

const formsFailure = error => ({
    type: FORM_DATA_FAILURE,
    error: error
});

const formsCancel = () => ({
    type: FORM_DATA_CANCEL,
    loading: false
});

const formCompleted = () => ({
    type: FORM_DATA_COMPLETED,
    payload: initialState
})

const formImagePosting = (field_name) => ({
    type: FORM_UPLOAD_STARTED,
    field_name: field_name
})

const formImagePosted = (field_name, fileArray) => ({
    type: FORM_UPLOAD_COMPLETED,
    fileArray: fileArray,
    field_name: field_name
});

export const _showNotice = (msg, variant) => ({
    type: FORM_NOTICE,
    msg: msg,
    variant: variant || 'info'
});

export const _clearNotes = () => ({
    type: FORM_CLEAR_ERROR
});

export function updateTheme(palette) {
    return {
        type: THEME_UPDATE,
        palette: palette
    }
};

export function addFieldWidget(field_name, index) {
    return {
        type: FORM_ADD_WIDGET,
        field_name: field_name,
        index: index
    }
};

export function removeFieldWidget(field_name, index) {
    return {
        type: FORM_REMOVE_WIDGET,
        field_name: field_name,
        index: index
    }
};

export function addMediaItem(obj) {
    return {
        type: FORM_MEDIA_ADD,
        payload: obj
    }
};

export function deleteMedia(fid) {
    return {
        type: FORM_MEDIA_DELETE,
        payload: fid
    }
};

export function populateTrack(obj) {
    return {
        type: FORM_POPULATE_TRACK,
        payload: obj
    }
};

export function populatePlaylist(obj, apiurl) {
    return {
        type: FORM_POPULATE_PLAYLIST,
        payload: obj,
        apiurl: apiurl
    }
};

export function populateReward(obj) {
    return {
        type: FORM_POPULATE_REWARD,
        payload: obj
    }
};

export function changeFieldVal(val, field_name, index, prop) {
    return {
        type: FORM_SET_FIELD_VALUE,
        val: val,
        field_name: field_name,
        index: index,
        prop: prop
    }
}

export const closeForm = () => {
    return dispatch => {
        dispatch(formsCancel());
    }
}

export const loadPasswordReminder = (email) => {
    return dispatch => {
        dispatch(formsStarted('/otp/account_otp/send', 'dialog'));
        dispatch(formsSuccess({
            fields: [{
                "field_name": "mail",
                "label": "Your Email",
                "description": "We will send you a one time login link",
                "type": "email",
                "bundle": "user",
                'data-propname': 'value',
                "default_value": email,
                "#required": true,
                "cardinality": 1
            }],
            instructions: {caption:'Send me a login link'}
        }, '/otp/account_otp/send'));
        return false;
    };
}

export const loadForm = (apiurl, ctx) => {
    return (dispatch, getState) => {
        const state = getState();
        if (state.forms.loading === true) return false;

        if (apiurl.indexOf('/forms/group/add') === 0) {
            // TODO: calculate features list price
            if (!state.auth.me.profile) {
                dispatch(push('/login'));
                return dispatch(_showNotice('Please <a href="/login">login</a> first', 'error'));
            }
            if (typeof window['Cypress'] === 'undefined') { // skip for testing
                if (typeof state.auth.me.profile.roles['verified_cc'] === 'undefined') { // < res.data.amount
                    dispatch(requestDeposit('', 'Please add a payment method'));
                } else {
                    var tid = getParam('game_type');
                    if (tid !== '') {
                        tid = parseInt(tid);
                        var cost = (tid === 81) ? 9.99 : (tid === 82) ? 19.99 : (tid === 83) ? 39.99 : (tid === 825) ? 0.99 : 29.99;
                        if (state.wallet.balance.usd < cost) { // < res.data.amount
                            var diff = parseFloat(cost - state.wallet.balance.usd).toFixed(2);
                            dispatch(requestDeposit(diff, 'Insufficient Funds. Please deposit at least $' + diff));
                        }
                    }
                }
            }
        } else if (apiurl.indexOf('/tracks') > 0 || apiurl.indexOf('/members') > 0 || apiurl.indexOf('/users') > 0 || apiurl.indexOf('/playlists') > 0) {
            if (!state.auth.me.profile) {
                return dispatch(_showNotice('Please <a href="/login">login</a> first', 'error'));
            } else if (typeof state.auth.me.profile.roles['verified_email'] !== 'number' && typeof state.auth.me.profile.roles['verified_fb'] !== 'number') {
                return dispatch(_showNotice('You must first verify your email. You can resend your link from "My Account" page', 'error'));
            }
        }

        if (!ctx) ctx = 'page';
        dispatch(formsStarted(apiurl, ctx));

        const tdata = getIdbySegment(apiurl);
        tdata.dom_ref = ctx;
        if (state.auth.me && state.auth.me.profile) {
            tdata.uid = state.auth.me.profile.uid[0].value;
        }

        return API.Get(apiurl).then((res) => {
            if (res.data.error) {
                dispatch(formsFailure(res.data.error));
            } else if (res.data.message === '') {
                dispatch(formsFailure('Unauthorized'));
            } else {
                dispatch(formsSuccess(res.data, apiurl));
            }

            window.logUse.logEvent('load_form', tdata);

        }).catch((err) => {
            tdata.verb = 'failed';
            window.logUse.logEvent('load_form', tdata);
            var msg = API.getErrorMsg(err);
            dispatch(formsFailure(msg));
        });
    };
};

export const submitTrack = (apiurl, data) => {
    return (dispatch, getState) => {

        const state = getState();
        if (state.forms.loading === true) return false;

        dispatch(formsStarted(apiurl, state.forms.ctx));

        console.log(apiurl, data);

        const req = {url: apiurl, data: data};
        req.method = apiurl.substring(apiurl.lastIndexOf('/') + 1) === 'edit' ? 'PUT' : 'POST';

        API.Request(req).then((res) => {
            if (res.data.error) {
                dispatch(formsFailure(res.data.error));
            } else {
                dispatch(formCompleted());

                if (typeof res.data.payout === 'number' && res.data.payout > 0) {
                    dispatch(_showNotice(res.data.success));
                }

                let url = apiurl.substring('/forms'.length, apiurl.lastIndexOf('/')); // strip 'forms' and verb
                if (state.forms.ctx === 'page') {
                    dispatch(push(url + '?v=' + new Date().getTime())); // entityReducer dispatches own updates
                } else {
                    if (req.method === 'POST') url += '/' + res.data.target_id; // on add, we need to target this track
                    API.Get(url).then( updated => {
                        console.log("got updated track: " + url, updated);
                        //data.entity_id = [{target_id:res.data.target_node}];
                        //data.id = [{value:res.data.target_id}];
                        dispatch(updateListTrack(updated.data));
                        dispatch(updatePlayerTrack(updated.data));
                        if (state.entity.apiData && state.entity.apiData.type[0].target_id === 'groups-group_node-tracks') {
                            dispatch(entityDataSuccess(updated.data));
                        }
                    });
                }
            }
        }).catch((err) => {
            let msg = API.getErrorMsg(err);
            dispatch(formsFailure(msg));
        });
    };
};

export const submitForm = (apiurl, data) => {
    return (dispatch, getState) => {

        const state = getState();
        if (state.forms.loading === true) return false;

        dispatch(formsStarted(apiurl, state.forms.ctx));

        console.log(apiurl, data);

        const req = {url: apiurl, data: data};
        req.method = apiurl.substring(apiurl.lastIndexOf('/') + 1) === 'edit' ? 'PUT' : 'POST';

        API.Request(req).then((res) => {
            if (res.data.error) {
                dispatch(formsFailure(res.data.error));
            } else {
                dispatch(formCompleted());
                if (apiurl === '/otp/account_otp/send') {
                    return dispatch(_showNotice(res.data.success));
                }

                if (typeof res.data.payout === 'number' && res.data.payout > 0) {
                    dispatch(_showNotice(res.data.success));
                }

                if (apiurl.indexOf('/forms/group/add') === 0) {
                    dispatch(push('/group/' + res.data.target_id));
                    return dispatch(initApp('/group/' + res.data.target_id, 'group-created')); // update form
                }

                let url = apiurl.substring('/forms'.length, apiurl.lastIndexOf('/')); // strip verb
                if (url.substring(url.lastIndexOf('/')) === '/tracks') {
                    url = url.substring(0, url.lastIndexOf('/'));
                    API.Get(url)
                }

                if (state.forms.ctx === 'page' || apiurl.indexOf("/playlists/add") > 1) {
                    dispatch(push(url + '?v=' + new Date().getTime()));
                }

            }
        }).catch((err) => {
            let msg = API.getErrorMsg(err);
            dispatch(formsFailure(msg));
        });
    };
};



export const submitDelete = (apiurl) => {
    return (dispatch, getState) => {

        var state = getState();
        if (state.forms.loading === true) return false;

        dispatch(formsStarted(apiurl));

        API.Request({url: apiurl, method: 'DELETE'}).then((res) => {
            if (res.data.error) {
                dispatch(formsFailure(res.data.error));
            } else {
                dispatch(formCompleted());
                var parts = apiurl.split('/'); // ex. ["", "forms", "group", "1", "playlists", "2471", "delete"]
                var dest = '/' + parts.slice(2, 5).join('/');
                if (apiurl.indexOf('/tracks') > -1) {
                    dest += '/' + parts[5]; // a track was deleted to redirect to it's playlist by ID
                }
                console.log("Delete Redirect: ", dest);
                dispatch(push(dest));
                // TODO: update player.tracklist if deleted came from playing
            }
        }).catch((err) => {
            var msg = API.getErrorMsg(err);
            dispatch(formsFailure(msg));
        });
    };
};


export const updateMediaField = (el, filename, title, ppp, copyright_owner, currency) => {
    return (dispatch, getState) => {

        const state = getState();
        if (state.forms.loading === true) return false;

        let formData = new FormData();
        let type = '';
        if (typeof el === 'object' && el.files) {
            const file = el.files[0];
            type = file.type; // file.type.split('/'); // audio|video
            if (type !== 'audio/mp3' && type !== 'video/mp4') {
                let ext = file.name.substring(file.name.lastIndexOf('.') + 1); // mime is sometimes wrong? check extension
                if (ext !== 'mp3' && ext !== 'mp4') {
                    return dispatch(_showNotice('Invalid file type. Please select mp3 or mp4 files only', 'error'));
                }
            }
            type = type.split('/');
            formData.append('files[]', el.files[0], file.name);
        } else {
            formData.append("files[]", el, filename);
            type = ['video'];
        }

        const parts = state.forms.apiurl.split('/'); // ex. /forms/group/9/playlists/8484/tracks/add

        formData.append('title', title);
        formData.append('filename', filename);
        formData.append('gid', parts[3]);
        formData.append('pid', parts[5]);
        formData.append('ppp', ppp);
        formData.append('copyright_owner', copyright_owner);
        formData.append('currency', currency);

        dispatch(formImagePosting('field_media'));

        API.Request({
            url: "/forms/media/" + type[0] + "/add",
            headers: {'Content-Type': `multipart/form-data; boundary=` + formData._boundary},
            method: 'POST',
            data: formData
        }).then((res) => {
            var err = API.checkError(res.data);
            if (err.length > 0) {
                dispatch(formsFailure(err)); // clearing loading
            } else {
                // TODO: addRole('artist') if transaction_id is present
                dispatch(addMediaItem(res.data));

                if (type[0] === 'video') {

                    let video = document.createElement('video');
                    video.preload = 'auto';
                    video.muted = true;
                    video.autoplay = true;
                    var snapshot = function(e) {
                        video.pause();
                        video.removeEventListener('loadeddata', snapshot);
                        // video.currentTime = 3;
                        console.log(e, video.videoWidth, video.videoHeight, video.duration);
                        var canvas = document.createElement('canvas');
                        var ctx = canvas.getContext('2d');
                        canvas.width = video.videoWidth; canvas.height = video.videoHeight;
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        canvas.toBlob(blob => {
                            console.log(blob);
                            dispatch(updateImageField({field_name:'field_cover', bundle:'tracks', filename:title+'.png'}, blob));
                            URL.revokeObjectURL(video.src);
                        }, 'image/png');
                    };
                    video.addEventListener('loadeddata', snapshot);
                    if (typeof el === 'object' && el.files) {
                        video.src = URL.createObjectURL(el.files[0]);
                    } else {
                        video.src = URL.createObjectURL(el);
                    }
                }

            }
        }).catch((err) => {
            var msg = API.getErrorMsg(err);
            dispatch(_showNotice(msg, 'error'));
            dispatch(formsFailure(msg));
        });
    };
}


export const updateImageField = (field, el) => {
    return (dispatch, getState) => {

        var state = getState();
        if (state.forms.loading === true) return false;

        var formData = new FormData();
        if (typeof el === 'object' && el.files) {
            formData.append('file', el.files[0]);
        } else {
            formData.append('file', el, field.filename);
        }

        var type = 'node';
        if (field.bundle === 'groups') {
            type = 'group';
        } else if (field.bundle.indexOf('groups-') === 0) {
            type = 'group_content';
        } else if (field.bundle === 'user' || field.bundle === 'account') {
            type = 'user';
        }

        dispatch(formImagePosting(field.field_name));

        var req = {
            url: "/file/upload/" + type + "/" + field.bundle + "/" + field.field_name,
            //url: "/file/upload/node/playlists/field_cover",
            //headers : {'Content-Type': `application/octet-stream; boundary=` + formData._boundary},
            headers: {'Content-Type': `multipart/form-data; boundary=` + formData._boundary},
            method: 'POST',
            data: formData
        }
        // req.headers['Content-Disposition'] = 'file;filename="filename.jpg"';

        API.Request(req).then((res) => {
            if (!res.data.fid || res.data.fid.length === 0) {
                dispatch(formsFailure('image post failed')); // clearing loading status
            } else {
                dispatch(formImagePosted(field.field_name, res.data));
            }
        }).catch((err) => {
            var msg = API.getErrorMsg(err);
            dispatch(_showNotice(msg, 'error'));
        });
    };
}

const initialState = {
    ctx: false,
    loading: false,
    api: null,
    apiurl: null,
    error: null
};

export default function formsReducer(newState = initialState, action) {
    var i = 0;
    switch (action.type) {
        case FORM_CLEAR_ERROR:
            delete newState.notice;
            newState.error = false;
            return newState;
        case FORM_NOTICE:
            newState.notice = action;
            return newState;
        case FORM_DATA_STARTED:
            if (newState.apiurl !== action.apiurl) {
                // TODO: don't erase on /delete
                newState.api = null;
            }
            newState.loading = true;
            newState.ctx = action.ctx;
            newState.apiurl = action.apiurl;
            return newState;
        case FORM_DATA_SUCCESS:
            newState.loading = false;
            newState.error = null;
            newState.api = action.payload;
            if (action.apiurl.indexOf('title=') > -1 && !newState.api.entity) {
                var title = getParam('title', action.apiurl);
                newState.api.entity = {
                    id: [{value: -1}],
                    entity_id: [{target_id: -1, target_label: title}],
                    label: [{value: title}],
                    type: [{target_id: 'groups-group_node-' + newState.apiurl.split('/')[4]}],
                    gid: [{target_id: newState.apiurl.split('/')[3]}],
                }
            }
            if (action.apiurl.indexOf('game_type=') > -1 && !newState.api.entity) {
                var tid = getParam('game_type');
                newState.api.entity = {
                    id: [{value: -1}],
                    field_game_type: [{target_id: tid}],
                }
            }
            newState.files = false; // clear memory
            return newState;
        case FORM_DATA_COMPLETED:
            return {...action.payload}; // resets to initialState
        case FORM_DATA_FAILURE:
            newState.loading = false;
            newState.error = action.error;
            for(let s in newState.files) {
                if (newState.files[s] === 'loading') {
                    newState.files[s] = undefined;
                    delete newState.files[s];
                }
            }
            return newState;
        case FORM_DATA_CANCEL:
            newState.loading = false;
            newState.ctx = false;
            newState.files = false;
            return newState;
        case FORM_UPLOAD_STARTED:
            if (!newState.files) newState.files = {};
            newState.files[action.field_name] = 'loading'; // means you can only have 1 file per field
            return newState;
        case FORM_UPLOAD_COMPLETED:
            if (!newState.files) newState.files = {};
            newState.files[action.field_name] = action.fileArray;
            // TODO: update field_cover or whatever field?!
            return newState;
        case FORM_MEDIA_ADD:
            if (!newState.api.node.field_media) newState.api.node.field_media = [];

            const exists = newState.api.node.field_media.findIndex(element => element.target_id === action.payload.target_id);

            if (exists > -1) newState.api.node.field_media[exists] = action.payload;
            else newState.api.node.field_media.push(action.payload);

            if (!newState.api.node.title || !newState.api.node.title[0] || newState.api.node.title[0].value === '') {
                newState.api.node.title = [{'value':action.payload.target_label}];
            }

            return newState;
        case FORM_MEDIA_DELETE:
            if (newState.api.node.field_media && newState.api.node.field_media.length > 0) {
                for (i = 0; i < newState.api.node.field_media.length; i++) {
                    if (newState.api.node.field_media[i].target_id === action.payload) {
                        newState.api.node.field_media.splice(i, 1);
                    }
                }
            }
            return newState;
        case FORM_POPULATE_TRACK:
            newState.loading = false;
            newState.error = null;
            newState.api.node = action.payload;
            return newState;
        case FORM_POPULATE_PLAYLIST:
            newState.loading = false;
            newState.error = null;
            newState.api = action.payload;
            return newState;
        case FORM_POPULATE_REWARD:
            newState.api.node = action.payload;
            if (!newState.api.entity || newState.api.entity.entity_id[0].target_id !== newState.api.node.nid[0].value) {
                newState.api.entity = {
                    entity_id: [{
                        target_id: newState.api.node.nid[0].value,
                        target_label: newState.api.node.title[0].value
                    }],
                    title: newState.api.node.title,
                    field_cover: newState.api.node.field_cover,
                    field_description: newState.api.node.body,
                }
            }
            return newState;
        case THEME_UPDATE:
            newState.palette = action.palette;
            return newState;
        case FORM_REMOVE_WIDGET:
            newState.api.entity[action.field_name].pop();
            return newState;
        case FORM_ADD_WIDGET:
            newState.api.entity[action.field_name].push({...newState.api.entity[action.field_name][0]});
            return newState;
        case FORM_SET_FIELD_VALUE:
            if (!action.index) action.index = 0;
            if (!action.prop) action.prop = 'value';
            if (typeof newState.api.entity !== 'undefined' && typeof newState.api.entity[action.field_name] !== 'undefined') {
                if (action.val === null) {
                    newState.api.entity[action.field_name].splice(action.index, 1); // delete the entry
                } else {
                    if (typeof newState.api.entity[action.field_name][action.index] === 'undefined') { // editting existing node
                        newState.api.entity[action.field_name][action.index] = {};
                    }
                    newState.api.entity[action.field_name][action.index][action.prop] = action.val;
                }
            } else { // new node
                for (i in newState.api.fields) {
                    if (newState.api.fields[i].field_name === action.field_name) {
                        if (action.val === null) {
                            newState.api.fields[i].default_value = null;
                            break;
                        } else {
                            if (typeof newState.api.fields[i].default_value[action.index] === 'undefined') newState.api.fields[i].default_value[action.index] = {};
                            newState.api.fields[i].default_value[action.index][action.prop] = action.val;
                            break;
                        }
                    }
                }
            }
            return newState;
        default:
            return newState;
    }
}
