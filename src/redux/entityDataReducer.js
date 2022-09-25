import API from "../Util/API";
import {getIdbySegment} from "../Util/WindowUtils";

const ITEM_DATA_SUCCESS = 'entity:ITEM_DATA_SUCCESS';
const ITEM_DATA_FAILURE = 'entity:ITEM_DATA_FAILURE';
const ITEM_DATA_STARTED = 'entity:ITEM_DATA_STARTED';

const UPDATE_RALLY_ITEM = 'rally:UPDATE_RALLY_ITEM';
const MOVE_RALLY_ITEM = 'rally:MOVE_RALLY_ITEM';
const MOVE_RALLY_HEAD = 'rally:MOVE_RALLY_HEAD';
const ITEM_INIT_COUNTER = 'rally:ITEM_INIT_COUNTER';
const COUNTDOWN_TIMER = 'rally:COUNTDOWN_TIMER';

export const entityDataSuccess = (rally, meeting) => ({
    type: ITEM_DATA_SUCCESS,
    rally: rally,
    meeting: meeting
});

export const entityDataStarted = (url) => ({
    type: ITEM_DATA_STARTED,
    url: url
});

export const entityDataFailure = error => ({
    type: ITEM_DATA_FAILURE,
    error: error
});

export const updateRallyItem = (key, val, index) => ({
    type: UPDATE_RALLY_ITEM,
    key: key,
    val: val,
    index: index
});

export const moveRallyItem = (from, to) => ({
    type: MOVE_RALLY_ITEM,
    to: to,
    from: from,
});

export const moveRallyHead = (to, from) => ({
    type: MOVE_RALLY_HEAD,
    to: to,
    from: from,
});

export const initCounter = () => ({
    type: ITEM_INIT_COUNTER
});

export const countDown = (index) => ({
    type: COUNTDOWN_TIMER,
    index: index
});

export const entityData = (url) => {
    return (dispatch, getState) => {

        const state = getState();
        if (state.entity.loading === true) return false;

        dispatch(entityDataStarted(url));

        API.Get(url).then((res) => {
            const msg = API.checkError(res.data);
            const tdata = getIdbySegment(url);
            tdata.bundle = url.split('/');
            tdata.bundle = tdata.bundle[tdata.bundle.length - 2];
            if (msg.length > 0) {
                tdata.verb = 'failed';
                dispatch(entityDataFailure(msg));
            } else {
                dispatch(entityDataSuccess(res.data));
                tdata.verb = 'view';
            }

            if (state.auth.me && state.auth.me.profile) {
                tdata.uid = state.auth.me.profile.uid[0].value;
            }
            window.logUse.logEvent('load_entity', tdata);


        }).catch((err) => {
            var msg = API.getErrorMsg(err);
            dispatch(entityDataFailure(msg));
        });
    };
};

const _initCounter = (draft) => {
    let total = 0;
    let headers = {};
    if (typeof draft.meeting.agenda === 'string') {
        draft.meeting.agenda = JSON.parse(draft.meeting.agenda);
    }
    draft.meeting.agenda.forEach((o, i) => {
        total += o.seconds
        o.countdown = o.seconds;
        if (typeof headers[o.nest] === 'undefined') headers[o.nest] = {
            label: o.nest,
            order: Object.values(headers).length,
            count: 0
        };
        headers[o.nest].count++;
    });
    draft.meeting.countRemains = total;
    draft.meeting.countScheduled = total;
    draft.meeting.headers = Object.values(headers);
    return draft;
}

const initialState = {
    loading: false,
    rally: false, meeting: false,
    url: '',
    error: null
};

export default function entityDataReducer(draft = initialState, action) {
    switch (action.type) {
        case ITEM_DATA_STARTED:
            draft.loading = true;
            draft.url = action.url;
            return draft;
        case ITEM_DATA_SUCCESS:
            draft.loading = false;
            draft.error = null;
            draft.meeting = action.meeting;
            draft.rally = action.rally;
            if (draft.meeting) {
                return _initCounter(draft);
            }
            return draft;
        case ITEM_DATA_FAILURE:
            draft.loading = false;
            draft.error = action.error
            return draft;
        case ITEM_INIT_COUNTER:
            return _initCounter(draft);
        case UPDATE_RALLY_ITEM:
            if (action.key === 'delete') {
                draft.meeting.agenda.splice(action.index, 1);
            } else if (action.key === 'clone') {
                draft.meeting.agenda.splice(action.index, 0, {...draft.meeting.agenda[action.index]});
                draft.meeting.agenda[action.index + 1].title += ' - copy';
            } else {
                draft.meeting.agenda[action.index][action.key] = action.val;
            }
            return draft;
        case MOVE_RALLY_ITEM:
            if (!draft.meeting.agenda[action.to]) return draft;
            let element = draft.meeting.agenda[action.from];
            if (!element) return draft;
            draft.meeting.agenda.splice(action.from, 1);
            element.nest = draft.meeting.agenda[action.to].nest;
            draft.meeting.agenda.splice(action.to, 0, element);
            return draft;
        case MOVE_RALLY_HEAD:
            console.log("TODO: move head", action);
            return draft;
        case COUNTDOWN_TIMER:
            let curStep = draft.meeting.agenda[action.index];
            if (typeof curStep.countdown !== 'number') {
                curStep.countdown = curStep.seconds;
            } else {
                curStep.countdown = curStep.countdown - 1;
            }
            --draft.meeting.countRemains;
            return draft;
        default:
            return draft;
    }
}
