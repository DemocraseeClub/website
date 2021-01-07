import API from '../Util/API';
import {getIdbySegment} from "./authActions";
import {commentLoadSuccess} from "./commentsReducer";
import {storeTrackList} from "./playerReducer";
const API_DATA_SUCCESS = 'lists:API_DATA_SUCCESS';
const API_DATA_FAILURE = 'lists:API_DATA_FAILURE';
const API_DATA_STARTED = 'lists:API_DATA_STARTED';
const MP3_UPDATE = 'lists:MP3_UPDATE';

const listDataSuccess = (apiData, ctx) => ({
  type: API_DATA_SUCCESS,
  payload: apiData,
  ctx:ctx
});

const listDataStarted = () => ({
  type: API_DATA_STARTED
});

const listDataFailure = error => ({
  type: API_DATA_FAILURE,
  error: error
});

export const updateListTrack = track => ({
    type: MP3_UPDATE,
    payload: track
});

export const nextPage = (meta, append) => {
    return dispatch => {
        const newMeta = {...meta};
        newMeta['start_index'] = newMeta['start_index'] + newMeta['perpage'];
        if (newMeta['start_index'] > newMeta['total_items']) {
            newMeta['start_index'] = 0; // loop
            newMeta['end_index'] = newMeta['perpage'];
        } else {
            newMeta['end_index'] = newMeta['end_index'] + newMeta['perpage'];
        }

        let url = newMeta.url + '?start_index=' + newMeta.start_index + '&perpage=' + newMeta.perpage;
        if (newMeta.cat) {
            url += '&cat=' + newMeta.cat;
        }
        if (newMeta.seed) {
            url += '&seed=' + newMeta.seed;
        }
        const tdata = getIdbySegment(url);
        API.Get(url).then((res) => {
            dispatch(storeTrackList(tdata.gid, tdata.pid, res.data, append));
        });
    }
}

export const changePerPage = (meta, perpage, append) => {
    return dispatch => {
        let url = meta.url + '?start_index=0&perpage=' + perpage;
        if (meta.cat) {
            url += '&cat=' + meta.cat;
        }
        const tdata = getIdbySegment(url);
        API.Get(url).then((res) => {
            dispatch(storeTrackList(tdata.gid, tdata.pid, res.data, append));
        });
    }
}

export const changeSort = (meta, sort, append) => {
    return dispatch => {
        const newMeta = {...meta};
        let url = newMeta.url + '?sort=' + sort; // always restart from start_index 0
        if (newMeta.cat) {
            url += '&cat=' + newMeta.cat;
        }
        const tdata = getIdbySegment(url);
        API.Get(url).then((res) => {
            dispatch(storeTrackList(tdata.gid, tdata.pid, res.data, append));
        });
    }
}



export const listData = (url, ctx) => {
    return (dispatch, getState) => {
        var state = getState();
        if (state.lists.loading === true) return false;
        const tdata = getIdbySegment(url);
        dispatch(listDataStarted());
        API.Get(url).then(res => {
            const msg = API.checkError(res.data);
            if (msg.length > 0) {
                dispatch(listDataFailure(msg));
                tdata.verb = 'failed';
            } else {
                if ((tdata.bundle === 'tracks' || tdata.bundle === 'plalylists') && res.data.data.length > 0) {
                    res.data.data.map( (o, i) => {
                        if (o.comments && o.comments.data.length > 0) {
                            return dispatch(commentLoadSuccess(tdata, o.comments)) // move comments to comment reducer
                        }
                        return true;
                    })
                }
                dispatch(listDataSuccess(res.data, ctx));
                if (res.data.metadata) {
                    tdata.start_index = res.data.metadata.start_index;
                }
                tdata.verb = 'view';
            }
            if (state.auth.me && state.auth.me.profile) {
                tdata.uid = state.auth.me.profile.uid[0].value;
            }
            window.logUse.logEvent('load_list', tdata);

        }).catch(err => {
            tdata.verb = 'failed';
            var msg = API.getErrorMsg(err);
            dispatch(listDataFailure(msg));
            window.logUse.logEvent('load_list', tdata);
        });
    };
};

const initialState = {
  loading: false,
  apiData: false,
  error: null
};

export default function listDataReducer(draft = initialState, action) {
  switch (action.type) {
    case API_DATA_STARTED:
      draft.loading = true;
      return draft;
    case API_DATA_SUCCESS:
      draft.loading = false;
      draft.error = null;
      draft.apiData = {...action.payload};
      return draft;
    case API_DATA_FAILURE:
      draft.error = action.error;
      draft.loading = false;
      return draft;
    case MP3_UPDATE:
      for(let f in draft.apiData.data) {
          if (draft.apiData.data[f].type[0].target_id !== 'groups-group_node-tracks') break;
          if (draft.apiData.data[f].id[0].value === action.payload.id[0].value) {
              draft.apiData.data[f] = action.payload;
          }
      }
      return draft;
    default:
      return draft;
  }
}
