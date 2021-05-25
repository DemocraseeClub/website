import API from '../Util/API';
import firebase from "firebase";

const ITEM_DATA_SUCCESS = 'entity:ITEM_DATA_SUCCESS';
const ITEM_DATA_FAILURE = 'entity:ITEM_DATA_FAILURE';
const ITEM_DATA_STARTED = 'entity:ITEM_DATA_STARTED';

const UPDATE_RALLY_ITEM = 'rally:UPDATE_RALLY_ITEM';
const MOVE_RALLY_ITEM = 'rally:MOVE_RALLY_ITEM';
const MOVE_RALLY_HEAD = 'rally:MOVE_RALLY_HEAD';
const ITEM_INIT_COUNTER = 'rally:ITEM_INIT_COUNTER';
const COUNTDOWN_TIMER = 'rally:COUNTDOWN_TIMER';

export const entityDataSuccess = apiData => ({
  type: ITEM_DATA_SUCCESS,
  payload: {...apiData}
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
  val:val,
  index:index
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
  index:index
});

export const fbRally = (id) => {
  return async (dispatch, getState) => {

    const state = getState();
    if (state.entity.loading === true) return false;
    dispatch(entityDataStarted(id));

    const roomRef = firebase.firestore().collection("rallies").doc(id)
    let data = await roomRef.get();
    if (data.exists) {
      let rally = data.data();
      rally.id = data.id;
      const snapshots = await firebase.firestore().collection(`rallies/${id}/meetings`).get()
      rally.meetings = await Promise.all(snapshots.docs.map(async (doc) => {
          return {id:doc.id, ...doc.data()};
      }))
      // if (data.type === 'meeting') {
        // dispatch(initCounter());
      // }
      console.log(rally);
      dispatch(entityDataSuccess(rally));
    } else {
      dispatch(entityDataFailure('invalid rally id'));
    }
  };
};

export const entityData = (url) => {
  return (dispatch, getState) => {

    const state = getState();
    if (state.entity.loading === true) return false;
    dispatch(entityDataStarted(url));
    API.Get(url).then((res) => {
      const msg = API.checkError(res.data);
      if (msg.length > 0) {
        dispatch(entityDataFailure(msg));
      } else {
        dispatch(entityDataSuccess(res.data));
        if (res.data.type === 'meeting') {
          dispatch(initCounter());
        }
      }
    }).catch((err) => {
      var msg = API.getErrorMsg(err);
      dispatch(entityDataFailure(msg));
    });
  };
};

const initialState = {
  loading: false,
  apiData: false,
  url:'',
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
      draft.apiData = {...action.payload};
      return draft;
    case ITEM_DATA_FAILURE:
      draft.loading = false;
      draft.error = action.error
      return draft;
    case ITEM_INIT_COUNTER:
      let total = 0;
      let headers = {};
      draft.apiData.lineItems.forEach((o, i) => {
        total += o.seconds
        o.countdown = o.seconds;
        if (typeof headers[o.nest] === 'undefined') headers[o.nest] = {label:o.nest, order:Object.values(headers).length, count:0};
        headers[o.nest].count++;
      });
      draft.apiData.countRemains = total;
      draft.apiData.countScheduled = total;
      draft.apiData.headers = Object.values(headers);
      return draft;
    case UPDATE_RALLY_ITEM:
      if (action.key === 'delete') {
        draft.apiData.lineItems.splice(action.index, 1);
      } else if (action.key === 'clone') {
        draft.apiData.lineItems.splice(action.index, 0, {...draft.apiData.lineItems[action.index]});
        draft.apiData.lineItems[action.index + 1].title += ' - copy';
      } else {
        draft.apiData.lineItems[action.index][action.key] = action.val;
      }
      return draft;
    case MOVE_RALLY_ITEM:
      if (!draft.apiData.lineItems[action.to]) return draft;
      let element = draft.apiData.lineItems[action.from];
      if (!element) return draft;
      draft.apiData.lineItems.splice(action.from, 1);
      element.nest = draft.apiData.lineItems[action.to].nest;
      draft.apiData.lineItems.splice(action.to, 0, element);
      return draft;
    case MOVE_RALLY_HEAD:
      console.log("TODO: move head", action);
      return draft;
    case COUNTDOWN_TIMER:
      let curStep = draft.apiData.lineItems[action.index];
      if (typeof curStep.countdown !== 'number') {
        curStep.countdown = curStep.seconds;
      } else {
        curStep.countdown = curStep.countdown - 1;
      }
      --draft.apiData.countRemains;
      return draft;
    default:
      return draft;
  }
}
