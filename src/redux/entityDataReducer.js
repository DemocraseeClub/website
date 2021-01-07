import API from '../Util/API';
import {getIdbySegment} from './authActions';

const ITEM_DATA_SUCCESS = 'entity:ITEM_DATA_SUCCESS';
const ITEM_DATA_FAILURE = 'entity:ITEM_DATA_FAILURE';
const ITEM_DATA_STARTED = 'entity:ITEM_DATA_STARTED';
const UPDATE_RALLY_ITEM = 'entity:UPDATE_RALLY_ITEM';
const MOVE_RALLY_ITEM = 'entity:MOVE_RALLY_ITEM';
const MOVE_RALLY_HEAD = 'entity:MOVE_RALLY_HEAD';

export const entityDataSuccess = apiData => ({
  type: ITEM_DATA_SUCCESS,
  payload: {...apiData}
});

const entityDataStarted = (url) => ({
  type: ITEM_DATA_STARTED,
  url: url
});

const entityDataFailure = error => ({
  type: ITEM_DATA_FAILURE,
  error: error
});

export const updateRallyItem = (item, index) => ({
  type: UPDATE_RALLY_ITEM,
  item: item,
  index:index
});

export const moveRallyItem = (to, from) => ({
  type: MOVE_RALLY_ITEM,
  to: to,
  from: from,
});

export const moveRallyHead = (to, from) => ({
  type: MOVE_RALLY_HEAD,
  to: to,
  from: from,
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
    case UPDATE_RALLY_ITEM:
      draft.apiData.lineItems[action.index] = action.item;
      return draft;
    case MOVE_RALLY_ITEM:
      let element = draft.apiData.lineItems[action.from];
      draft.apiData.lineItems.splice(action.from, 1);
      draft.apiData.lineItems.splice(action.to, 0, element);
      return draft;
    case MOVE_RALLY_HEAD:
      console.log("TODO: move head", action);
      return draft;
    default:
      return draft;
  }
}
