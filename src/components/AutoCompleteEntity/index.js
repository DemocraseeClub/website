import AutoCompleteEntity from './AutoCompleteEntity';
import {connect} from 'react-redux';
import {addMediaItem, loadForm, populatePlaylist, populateReward, populateTrack} from '../../redux/formsReducer';
import {testPlay} from '../../redux/playerReducer';

const mapStateToProps = (state) => {
 var newState = {}; // forms:{...state.forms}
 newState.location = state.router.location;
 if (state.player.playlist || (state.forms.apiurl && state.forms.apiurl.indexOf('/tracks/') > -1))  {
  newState.hasPlaylist = true; // autocomplete for MP3s due to + from dashboard or new track form without a playlist
 }
 return newState;
};

const mapDispatchToProps = dispatch => {
 return {
  loadForm: (url, ctx) => {
   dispatch(loadForm(url, ctx));
  },
  testPlay: (obj, source) => {
   dispatch(testPlay(obj, source));
  },
  addMediaItem : (obj) => {
   dispatch(addMediaItem(obj));
  },
  populateTrack : (track) => {
   dispatch(populateTrack(track));
  },
  populatePlaylist : (plist) => {
   dispatch(populatePlaylist(plist));
  },
  populateReward : (plist) => {
   dispatch(populateReward(plist));
  }
 };
};

export default connect(
 mapStateToProps,
 mapDispatchToProps
)(AutoCompleteEntity);
