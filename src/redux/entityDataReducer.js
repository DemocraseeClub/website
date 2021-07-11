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
            let obj = await normalizeUser(tax, ["picture", "coverPhoto"]);
            results.push(obj);
        } else {
            results.push({id: tax.id, ...tax.data()})
        }
    }
    return results;
}

export const normalizeSubscription = async (doc, fields) => {
    let obj = {id: doc.id, ...doc.data()};

    if(obj?.subscriber && fields.includes("subscriber")) {

        const subscriber = await obj.subscriber.get();
        obj.subscriber = await normalizeUser(subscriber, ["picture"])
    }

    if(obj?.rally && fields.includes("rally")) {

        const rally = await obj.rally.get();
        obj.rally = await normalizeRally(rally, [])
    }

    if(obj?.meeting && fields.includes("meeting")) {

        const meeting = await obj.meeting.get();
        obj.meeting = await normalizeMeeting(meeting, [])
    }


    return obj;
}

export const normalizeMeeting = async (doc, fields) => {
    let meet = (typeof doc.data === 'function') ? {id: doc.id, ...doc.data()} : doc;
    console.log(doc.data(), "meetingData")

    let promises = []

    if (meet?.agenda) {
        meet.agenda = JSON.parse(meet.agenda);
    }

    if(meet?.meeting_type && fields.includes("meeting_type")) {
        const meeting_type = await meet.meeting_type.get();
        meet.meeting_type = {id: meeting_type.id, ...meeting_type.data()}
    }

    if(meet?.city && fields.includes("city")) { //TODO normalize city

        const city = await meet.city.get();
        meet.city = {id: city.id, ...city.data()}

    }

    if(meet?.author && fields.includes("author")) {
       
        const author = await meet.author.get();
        promises.push(normalizeUser(author, ["picture"], meet, "author"))

    }

    if(meet?.speakers && fields.includes("speakers")) {
        let speakers = [];
        
        for (let i = 0; i < meet.speakers.length; i++) {

            let speaker = await meet.speakers[i].get()

            speakers.push(normalizeUser(speaker, ["picture"]))

        }

        promises.push(getArray(meet, speakers, "speakers"))
    }

    if(meet?.moderators && fields.includes("moderators")) {
        let moderators = [];
        
        for (let i = 0; i < meet.moderators.length; i++) {

            let moderator = await meet.moderators[i].get()

            moderators.push(normalizeUser(moderator, ["picture"]))

        }

        promises.push(getArray(meet, moderators, "moderators"))
    }

    await Promise.all(promises)
    console.log("NORMALIZED MEETING: " + fields, meet);


    return meet;
}

export const normalizeUser = async (doc, fields, data, propertyName) => {
   
    let obj = {id: doc.id, ...doc.data()}; // TODO: just get picture, roles, displayName (maybe bio)

    let promises = []


    if (obj?.picture && fields.includes("picture")) {
        let path = window.fbStorage.ref(obj.picture);
        promises.push(getResourceURL(path, obj, "picture"))
    }
    if (obj?.coverPhoto && fields.includes("coverPhoto")) { // TODO: only request if on user's profile page
        let path = window.fbStorage.ref(obj.coverPhoto);
        promises.push(getResourceURL(path, obj, "coverPhoto"))
    }

    await Promise.all(promises)


    if(data && propertyName) {

        data[propertyName] = obj

    }

    return obj



}

export const normalizeResource = async (doc, fields) => {
    let obj = {id: doc.id, ...doc.data()};

    if(obj?.author && fields.includes("author")) {

        const author = await obj.author.get();
        obj.author = await normalizeUser(author, ["picture", "coverPhoto"])
    }


    if (obj?.image && fields.includes("image")) {
        let path = window.fbStorage.ref(obj.image);
        const url = await path.getDownloadURL();
        obj.image = url;
    }

    if(obj?.resource_type && fields.includes("resource_type")) {

        const resource_type = await obj.resource_type.get();
        obj.resource_type = {id:resource_type.id, ...resource_type.data()}

    }



    return obj;
}

const getResourceURL = async (path, data, propertyName) => {

    const url = await path.getDownloadURL()
    data[propertyName] = url
}

const getArray = async (obj, promises, propertyName) => {

    obj[propertyName] = await Promise.all(promises)

}

const getEntity = async (ref) => {

    let retrieved = await ref.get()
    return {id:retrieved.id, ...retrieved.data()}

}

export const normalizeRally = async (doc, fields) => {
    let obj = {id: doc.id, ...doc.data()};

    let promises = []

    if (obj?.author && fields.includes("author")) {
        const author = await obj.author.get();
        promises.push(normalizeUser(author, ["picture"], obj, "author"))
    }

    if (obj?.picture && fields.includes("picture")) {
        let path = window.fbStorage.ref(obj.picture);
        promises.push(getResourceURL(path, obj, "picture"))
    }

    if (obj?.promo_video && fields.includes("promo_video")) {
        let path = window.fbStorage.ref(obj.promo_video);
        promises.push(getResourceURL(path, obj, "promo_video"))
    }

    if (fields.includes("meetings")) {
        let meetingDocs = await doc.ref.collection("meetings").get();
        if (meetingDocs?.docs && meetingDocs?.docs.length > 0) {
            let meetings = [];
            for (let i = 0; i < meetingDocs.docs.length; i++) {
                if (i === 0) {
                    meetings.push(normalizeMeeting(meetingDocs.docs[i], ['author', 'speakers', 'moderators', 'city', 'meeting_type']));
                } else {
                    meetings.push(normalizeMeeting(meetingDocs.docs[i], ['author', 'city', 'meeting_type']));
                }
            }

            promises.push(getArray(obj, meetings, "meetings"))

        }
    }

    if (obj?.research) {
        obj.research = JSON.parse(obj.research);
    }

    if (obj?.topics && fields.includes("topics")) {
       let topics = [];
            for (let i = 0; i <obj.topics.length; i++) {

                topics.push(getEntity(obj.topics[i]));
        }

        promises.push(getArray(obj, topics, "topics"))
    }

    if (obj?.stakeholders && fields.includes("stakeholders")) {
        let stakeholders = [];
            for (let i = 0; i <obj.stakeholders.length; i++) {

                stakeholders.push(getEntity(obj.stakeholders[i]));
            }

        promises.push(getArray(obj, stakeholders, "stakeholders"))
    }

    if (obj?.wise_demo && fields.includes("wise_demo")) {
        let wise_demo = [];
            for (let i = 0; i <obj.wise_demo.length; i++) {

                wise_demo.push(getEntity(obj.wise_demo[i]));
        }

        promises.push(getArray(obj, wise_demo, "wise_demo"))
    }


    await Promise.all(promises)

    console.log("NORMALIZED RALLY BY " + fields, obj)
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
