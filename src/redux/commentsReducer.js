import API from '../Util/API';
import {getIdbySegment} from './authActions';
import {_showNotice} from "./formsReducer";

const COMMENT_POST_STARTED = 'comment:COMMENT_POST_STARTED';
const COMMENT_POST_SUCCESS = 'comment:COMMENT_POST_SUCCESS';
const COMMENT_DELETE_SUCCESS = 'comment:COMMENT_DELETE_SUCCESS';
const COMMENT_EDIT_SUCCESS = 'comment:COMMENT_EDIT_SUCCESS';

const COMMENT_LOAD_SUCCESS = 'comment:COMMENT_LOAD_SUCCESS';

const commentPostStarted = (apiurl) => ({
    type: COMMENT_POST_STARTED,
    apiurl: apiurl
});

export const commentLoadSuccess = (tdata, res) => ({
    type: COMMENT_LOAD_SUCCESS,
    res: res,
    tdata:tdata
});

const commentPostSuccess = (comment) => ({
    type: COMMENT_POST_SUCCESS,
    comment: comment
});

const commentDeleteSuccess = (res, cid) => ({
    type: COMMENT_DELETE_SUCCESS,
    res:res,
    cid:cid
});

const commentEditSuccess = (comment) => ({
    type: COMMENT_EDIT_SUCCESS,
    comment:comment
});



export const loadComments = (url, ctx) => {
    return (dispatch, getState) => {
        var state = getState();
        if (state.comments.loading === true) return false;
        const tdata = getIdbySegment(url);
        tdata.verb = 'failed';
        if (state.auth.me && state.auth.me.profile) {
            tdata.uid = state.auth.me.profile.uid[0].value;
        }
        API.Get(url).then(res => {
            const msg = API.checkError(res.data);
            if (msg.length > 0) {
                dispatch(_showNotice(msg, 'error'));
            } else {
                dispatch(commentLoadSuccess(tdata, res.data));
                if (res.data.metadata) {
                    tdata.start_index = res.data.metadata.start_index;
                    tdata.count = res.data.data.length;
                }
                tdata.verb = 'view';
            }
            window.logUse.logEvent('load_comments', tdata);
        }).catch(err => {
            var msg = API.getErrorMsg(err);
            dispatch(_showNotice(msg, 'error'));
        });
    };
};

export function postComment(apiurl, obj) {
    return (dispatch, getState) => {
        const state = getState();
        if (!state.auth.me.profile) {
            return dispatch(_showNotice('Please <a href="/login">login</a> first', 'error'));
        }
        dispatch(commentPostStarted(apiurl));
        const tdata = getIdbySegment(apiurl);
        tdata.verb = 'comment-failed';
        tdata.uid = state.auth.me.profile.uid[0].value;
        const commentObj = {comment_body: [{value:obj.comment}]};
        if (obj.cid) {
            commentObj.cid = [{value:obj.cid}]; // threading
        }
        API.Post(apiurl, commentObj).then((res) => {
            var msg = API.checkError(res.data);
            if (msg.length > 0 || !res.data.success) {
                dispatch(_showNotice(msg, 'error'));
            } else {
                var tocopy = {'field_headshot':true, 'field_avatar':true, 'user_picture':true};
                for(var c in tocopy) {
                    if (state.auth.me.profile[c].length > 0 && state.auth.me.profile[c][0].url) {
                        res.data.comment.uid[0]['url'] = state.auth.me.profile[c][0].url;
                        break;
                    }
                }
                if (state.auth.me.profile.field_name.length > 0) {
                    res.data.comment.uid[0]['target_label'] = state.auth.me.profile['field_name'][0].value
                }
                dispatch(commentPostSuccess(res.data.comment))
                dispatch(_showNotice(res.data.success));
                tdata.verb = 'comment';
            }
            window.logUse.logEvent('comment', tdata);
        }).catch((err) => {
            var msg = API.getErrorMsg(err);
            dispatch(_showNotice(msg, 'error'));
            window.logUse.logEvent('comment', tdata);
            return err;
        });
    }
}

export function editComment(apiurl, comment) {
    return (dispatch, getState) => {
        dispatch(commentPostStarted(apiurl));
        const state = getState();
        const tdata = getIdbySegment(apiurl);
        tdata.verb = 'comment-edit-failed';
        tdata.uid = state.auth.me.profile.uid[0].value;
        API.Put(apiurl, comment).then((res) => {
            var msg = API.checkError(res.data);
            if (msg.length > 0 || !res.data.success) {
                dispatch(_showNotice(msg, 'error'));
            } else {
                res.data.comment.uid = state.auth.me.profile.uid;
                dispatch(commentEditSuccess(res.data.comment))
                dispatch(_showNotice(res.data.success));
                tdata.verb = 'comment-edit';
            }
            window.logUse.logEvent('comment', tdata);
        }).catch((err) => {
            var msg = API.getErrorMsg(err);
            dispatch(_showNotice(msg, 'error'));
            window.logUse.logEvent('comment', tdata);
            return err;
        });
    }
}

export function deleteComment(apiurl) {
    return (dispatch, getState) => {
        dispatch(commentPostStarted(apiurl));
        const state = getState();
        const tdata = getIdbySegment(apiurl);
        tdata.verb = 'comment-delete-failed';
        tdata.uid = state.auth.me.profile.uid[0].value;
        API.Delete(apiurl).then((res) => {
            var msg = API.checkError(res.data);
            if (msg.length > 0 || !res.data.success) {
                dispatch(_showNotice(msg, 'error'));
            } else {
                dispatch(commentDeleteSuccess(res.data, tdata.cid))
                dispatch(_showNotice(res.data.success));
                tdata.verb = 'comment-delete';
            }
            window.logUse.logEvent('comment', tdata);
        }).catch((err) => {
            var msg = API.getErrorMsg(err);
            dispatch(_showNotice(msg, 'error'));
            window.logUse.logEvent('comment', tdata);
            return err;
        });
    }
}

export const updateTrackComments = (json, obj) => {
    return (dispatch, getState) => {

    };
}


const initialState = {
    apiurl: false, // current posting comment

    // lists of comments keyed by group_content id
    threads:{},
    error: null
};

export default function commentsReducer(draft = initialState, action) {
    let id, cid, has = null;
    switch (action.type) {
        case COMMENT_POST_SUCCESS:
            id = action.comment.entity_id[0]['target_id'];
            var pid = (action.comment.pid.length > 0) ? action.comment.pid[0].target_id : 0;
            if (typeof draft.threads[id] === 'undefined') {
                let getUrl = draft.apiurl.split('/');
                getUrl.shift(); // remove /forms
                getUrl.unshift(); // remove all
                draft.threads[id] = {
                    data:[action.comment],
                    metadata: {
                        url:getUrl.join('/'),
                        request_time:new Date().getTime(),
                        perpage:20,
                        start_index:0,
                        type:"comments",
                        end_index:10,
                        sort:"cid",
                        page_title:"Comments",
                        total_items:0
                    }
                }
            } else if (pid > 0) {
                has = draft.threads[id].data.findIndex(e => (e.pid.length > 0 && e.pid[0].target_id === pid) );
                if (has > -1) {
                    draft.threads[id].data.splice(has, 0, action.comment);
                } else {
                    draft.threads[id].data.push(action.comment);
                }

            } else {
                draft.threads[id].data.push(action.comment);
            }
            draft.apiurl = false;
            return draft;
        case COMMENT_EDIT_SUCCESS:
            id = action.res.comment.entity_id[0]['target_id'];
            cid = action.res.comment.cid[0]['value'];
            has = draft.threads[id].data.findIndex(i => i.cid[0].value === cid);
            draft.threads[id].data[has] = action.res.comment;
            draft.apiurl = false;
            return draft;
        case COMMENT_DELETE_SUCCESS:
            id = action.res.entity_id;
            cid = action.comment_id;
            has = draft.threads[id].data.findIndex(i => i.cid[0].value === cid);
            delete draft.threads[id].data[has];
            draft.threads[id].metadata.total_items--;
            draft.apiurl = false;
            return draft;
        case COMMENT_LOAD_SUCCESS:
            draft.threads[action.tdata.tid || action.tdata.pid] = action.res;
            return draft;
        case COMMENT_POST_STARTED:
            draft.apiurl = action.apiurl;
            return draft;
        default:
            return draft;
    }
}
