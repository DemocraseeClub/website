import firebase from "firebase";

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

/**
 * TODO: replace "depth" with field list
 * depth = 0 || undefined  > don't get anything else
 * depth = 1 > get author name, picture
 * depth = 2 > + get meeting list
 * dpeth = 3 > + get meeting authors, pictures, promo videos, etc...
 */

export const normalizeDoc = async (docs, type) => {
    if (!docs || docs.length === 0) return [];
    let results = [];
    for (let j = 0; j < docs.length; j++) {
        const tax = await docs[j].get();
        if (['author', 'speakers', 'moderators'].includes(type)) {
            let obj = await normalizeUser(tax, 1);
            results.push(obj);
        } else {
            results.push({id: tax.id, ...tax.data()})
        }
    }
    return results;
}

export const normalizeMeeting = async (doc, depth) => {
    let meet = {
        id: doc.id,
        ...doc.data(),
    };

    if (meet.agenda) {
        meet.agenda = JSON.parse(meet.agenda);
    }

    if (depth > 0) {
        // TODO: normalize start_end_times
        let taxonomies = ['meeting_type', 'city', 'author', 'speakers', 'moderators'];
        for (let i = 0; i < taxonomies.length; i++) {
            meet[taxonomies[i]] = await normalizeDoc(meet[taxonomies[i]], taxonomies[i]);
        }
    }
    console.log("NORMALIZED MEETING: " + depth, meet);

    return meet;
}

export const normalizeUser = async (doc, depth) => {
    let obj = {id: doc.id, ...doc.data()}; // TODO: just get picture, roles, displayName (maybe bio)
    if (obj.picture) {
        let path = window.fbStorage.ref(obj.picture);
        const url = await path.getDownloadURL();
        obj.picture = url;
    }
    if (obj.coverPhoto && depth > 0) { // TODO: only request if on user's profile page
        let path = window.fbStorage.ref(obj.coverPhoto);
        const url = await path.getDownloadURL();
        obj.coverPhoto = url;
    }
    return obj;
}

export const normalizeRally = async (doc, depth) => {
    let obj = {id: doc.id, ...doc.data()};

    if (obj?.author) {
        const author = await obj.author.get();
        obj.author = await normalizeUser(author, depth)
    }

    if (obj.picture) {
        let path = window.fbStorage.ref(obj.picture);
        const url = await path.getDownloadURL();
        obj.picture = url;
    }

    if (obj.promo_video && depth > 0) {
        let path = window.fbStorage.ref(obj.promo_video);
        const url = await path.getDownloadURL();
        obj.promo_video = url;
    }

    if (depth > 0) {
        let meetingDocs = await doc.ref.collection("meetings").get();
        if (meetingDocs?.docs && meetingDocs?.docs.length > 0) {
            obj.meetings = [];
            for (let i = 0; i < meetingDocs.docs.length; i++) {
                obj.meetings.push(await normalizeMeeting(meetingDocs.docs[i], depth));
            }
        }
    }

    if (obj.research) {
        obj.research = JSON.parse(obj.research);
    }

    let taxonomies = ['topics', 'stakeholders', 'wise_demo'];
    for (let i = 0; i < taxonomies.length; i++) {
        obj[taxonomies[i]] = await normalizeDoc(obj[taxonomies[i]], taxonomies[i]);
    }

    console.log("NORMALIZED RALLY BY " + depth, obj)
    return obj;

};

export const fbRally = (id) => {
    return async (dispatch, getState) => {

        const state = getState();
        if (state.entity.loading === true) return false;
        dispatch(entityDataStarted(id));

        const roomRef = firebase.firestore().collection("rallies").doc(id)
        let doc = await roomRef.get();
        if (doc.exists) {
            let rally = await normalizeRally(doc, 3);
            dispatch(entityDataSuccess(rally, null));
        } else {
            dispatch(entityDataFailure('invalid rally id'));
        }
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
