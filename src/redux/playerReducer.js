import API from '../Util/API';
import Drupal2Json from '../Util/Drupal2Json';
import Grammer from "../Util/Grammer";
import { _showNotice} from "./formsReducer";
import {nextPage} from "./listDataReducer";
const MP3_PLAY = 'mp3s:PLAY'; // play track
const MP3_LOAD = 'mp3s:LOAD'; // set, display and preload for current track
const MP3_PLAYLIST = 'mp3s:PLAYLIST'; // set active playlist for current track
const MP3_TRACKLIST = 'mp3s:TRACKLIST';
const MP3_TEST = 'mp3s:TEST'; // play sample from youtube, tam, WITHOUT adding it to any playlists
const MP3_PAUSE = 'mp3s:MP3_PAUSE';
const MP3_UPDATE = 'mp3s:MP3_UPDATE';
const LIST_PURCHASED = 'mp3s:LIST_PURCHASED';


export const playlistPurchased = obj => ({
    type: LIST_PURCHASED,
    res: obj
});

const _setActivePlaylist = playlist => ({
    type: MP3_PLAYLIST,
    payload: {...playlist}
});

export const setActivePlaylist = (pid, gid) => {
    return (dispatch, getState) => {
        var state = getState();
        if (state.player.playlist &&
            state.player.playlist.id[0].value === pid) {
            return false; // do nothing since playlist is already active
        }
        if (state.entity.apiData &&
            state.entity.apiData.type[0]['target_id'] === 'groups-group_node-playlist' &&
            state.entity.apiData.id[0]['value'] === pid) {
            dispatch(_setActivePlaylist(state.entity.apiData));
        }
        API.Get('/group/' + gid + '/playlists/' + pid).then((res) => {
            dispatch(_setActivePlaylist(res.data));
        });
    };
}

export const storeTrackList = (gid, pid, apiData, append) => ({
    type: MP3_TRACKLIST,
    pid:pid,
    gid:gid,
    apiData: apiData,
    append:append
});

const _playTrack = (track, media) => {
    console.log('_playTrack ' + media, track);
    if (!media) {
        let tnode = new Drupal2Json(track.node);
        if(tnode.findPropVal('field_media', 'youtube', 'target_bundle') === 'youtube') {
            media = 'youtube';
        } else if(tnode.findPropVal('field_media', 'video', 'target_bundle') === 'video') {
            media = 'video';
        } else {
            media = 'audio';
        }
    }
    return {
        type: MP3_PLAY,
        media: media,
        payload: {...track}
    }
};

const _testPlay = (track, media) => ({
    type: MP3_TEST,
    media: media,
    payload: {...track}
});

export const pausePlayer = () => ({
    type: MP3_PAUSE
});

export const updatePlayerTrack = track => ({
    type: MP3_UPDATE,
    payload: track
});

export const findAndPlay = (tid, pid, gid, media) => {
    return (dispatch, getState) => {
        const state = getState();
        let track = null, index = 0;

        if (!state.auth.me.profile || typeof state.auth.me.profile.roles['access_mp3'] === 'undefined') {
          if (media === 'audio' || media === 'video') {
            return dispatch(_showNotice('You must subscribe to TAM to listen to MP3s', 'info'));
          } // else lets wait to see if track has youtube
        }

        if (state.player.tracklist[pid] && state.player.tracklist[pid].data) {
            for (index = 0; index < state.player.tracklist[pid].data.length; index++) {
                track = state.player.tracklist[pid].data[index];
                if (track.id[0].value === tid || !tid) {
                    return dispatch(_playTrack(track, media));
                }
            }
        }
        if (tid) {
            API.Get('/group/' + gid + '/playlists/' + pid + '/tracks/' + tid).then((res) => {
                dispatch(_playTrack(res.data, media));
            });
        }
    };
}

export const testPlay = (obj, source) => {
    return dispatch => {
        dispatch(_testPlay(obj, source));
    };
}

export const playNext = () => {
    return (dispatch, getState) => {
        const p = getState().player;
        if (!p.playlist || !p.curTrack) return false;
        const pid = p.playlist.id[0].value;
        if (!p.tracklist[pid] || !p.tracklist[pid].data) return false;
        if (!p.tracklist[pid].metadata.total_items === 0) {
            return dispatch(_showNotice(`There are no ${Grammer.g('tracks', 'p')} in this ${Grammer.g('playlists', 's')}`, 'warning'));
        }

        const list = p.tracklist[pid].data;
        let nextId = 0;
        for (let l = 0; l < list.length; l++) {
            if (list[l].id[0].value === p.curTrack.id[0].value) {
                if (l === list.length - 1) {
                    if (list[l].length < p.tracklist[pid].metadata.total_items) {
                        return dispatch(_showNotice(`Shuffle this ${Grammer.g('playlists', 's')} to get new ${Grammer.g('tracks', 'p')}. Or upgrade to unlock the full list`, 'warning'));
                    }
                    nextId = 0;
                    break;
                } else {
                    nextId = l + 1;
                    break;
                }
            }
        }

        // now make sure next track actually has media and don't run an infinite loop
        let nextTrack = list[nextId];
        let count = 0;
        while (nextTrack.node.field_media.length === 0 && count < list.length) {
            nextId = (nextId === list.length - 1) ? 0 : nextId++;
            nextTrack = list[nextId];
            count++;
        }

        dispatch(playTrack(nextTrack));
        if (nextId === list.length - 1) {
            // console.log('auto paginate since we\'re now on the last track: ')
            dispatch(nextPage(p.tracklist[pid].metadata, false))
        }
    };



}

export const playTrack = (track, media) => {
    return (dispatch, getState) => {

        const me = getState().auth.me;

        let tnode = new Drupal2Json(track.node);
        if (!media) {
            if(tnode.findPropVal('field_media', 'youtube', 'target_bundle') === 'youtube') {
                media = 'youtube';
            } else if(tnode.findPropVal('field_media', 'video', 'target_bundle') === 'video') {
                media = 'video';
            } else {
                media = 'audio';
            }
        }

        if (!me.profile || typeof me.profile.roles['access_mp3'] === 'undefined') {
          if (media === 'audio' || media === 'video') {
            var ppp = tnode.findPropVal('field_media', media, 'target_bundle');
            if (ppp === null || ppp > 0) {
                return dispatch(_showNotice('You must subscribe to TAM to listen to TaMP3s', 'warning'));
            }
          }
        }

        dispatch(_playTrack(track, media));
    };
};

const initialState = {
    status: '', // when any music is currently being played. not which song though
    playlist: null,
    tracklist: {}, // {pid:[{tid},{tid}...], ...}
    testPlay: false,
    curTrack: null, // db object of track
    notice:false
};

export default function playerReducer(draft = initialState, action) {
    draft.notice = null; // always reset this
    switch (action.type) {
        case MP3_TRACKLIST:
            /* if (action.apiData.append === true) {
                if (!draft.tracklist[action.pid]) draft.tracklist[action.pid] = {metaData: {start_index: 0}};
                action.apiData.metadata.start_index = draft.tracklist[action.pid].metadata.start_index;
                draft.tracklist[action.pid].metadata = action.apiData.metadata;

                draft.tracklist[action.pid].data = draft.tracklist[action.pid].data.concat(action.apiData.data);
            } else {

            } */
            draft.tracklist[action.pid] = action.apiData;
            return draft;
        case MP3_PLAYLIST:
            draft.playlist = {...action.payload};
            return draft;
        case MP3_TEST:
            draft.testPlay = {...action.payload};
            draft.curTrack = false;
            draft.media = action.media;
            return draft;
        case MP3_PLAY:
            console.log("curTrack set", action);
            draft.testPlay = false;
            draft.curTrack = {...action.payload};
            draft.media = action.media;
            draft.notice = false;
            draft.status = 'playing';
            return draft;
        case MP3_PAUSE:
            draft.status = 'paused';
            return draft;
        case MP3_LOAD:
            draft.curTrack = {...action.payload};
            draft.media = action.media;
            draft.status = 'loading';
            return draft;
        case LIST_PURCHASED:
            if (!draft.tracklist[action.res.pid]) return draft;
            if (typeof draft.tracklist[action.res.pid].metadata.p_roles === 'undefined') draft.tracklist[action.res.pid].metadata.p_roles = {};
            draft.tracklist[action.res.pid].metadata.p_roles.purchased = 1;
            return draft; // guarranteed only 1 match per list
        case MP3_UPDATE:
          let pid = action.payload.field_playlist_gc[0].target_id;
          if (!draft.tracklist[pid]) return draft;
          let list = draft.tracklist[pid].data;
          for(let f in list) {
              if (list[f].id[0].value === action.payload.id[0].value) {
                  draft.tracklist[pid].data[f] = Object.assign(draft.tracklist[pid].data[f], action.payload); // merge
              }
          }
          if (draft.curTrack && draft.curTrack.id[0].id === action.payload.id[0].value) {
              draft.curTrack = action.payload;
          }
          return draft;
        default:
            return draft;
    }
}
