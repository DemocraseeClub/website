import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Autosuggest from 'react-autosuggest';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import {withStyles} from '@material-ui/core/styles';
import {withRouter} from 'react-router';
import {debounce, throttle} from "throttle-debounce";
import FormControl from '@material-ui/core/FormControl';
import API from '../../Util/API';
import RemoteAPI from '../../Util/RemoteAPI';
// import Input from '@material-ui/core/Input';
import AutoCompleteOption from '../AutoCompleteOption';
import CircularProgress from '@material-ui/core/CircularProgress';

import InputAdornment from '@material-ui/core/InputAdornment';
import Form2Json from '../../Util/Form2Json';
import QueueMusic from "@material-ui/icons/QueueMusic";
import MusicNote from "@material-ui/icons/MusicNote";
import CardGiftCard from "@material-ui/icons/CardGiftcard";
import AccountCircle from '@material-ui/icons/AccountCircle';
import CategoryIcon from "@material-ui/icons/Category";
import CompareArrows from '@material-ui/icons/CompareArrows';
import GroupAdd from '@material-ui/icons/GroupAdd';
import Config from "../../Config";

class AutoCompleteEntity extends Component {

 constructor(props) {
  super(props);
  this.state = { q: '', results : [], selected:{target_label:'', target_id:-1}, loading:false};
  this.autocompleteSearchDebounced = debounce(1000, this.autocompleteSearch);
  this.autocompleteSearchThrottled = throttle(1000, this.autocompleteSearch);

  this.handleSelection = this.handleSelection.bind(this);
  this.onSuggestionSelected = this.onSuggestionSelected.bind(this);
  this.renderInputComponent = this.renderInputComponent.bind(this);

  if (this.props.source !== 'tracks' && this.props.source !== 'youtube' && props.entry && typeof props.entry[props.index] === 'object' && typeof props.entry[props.index]['target_label'] === 'string') {
   this.state.q = props.entry[props.index]['target_label'];
  }
 }

 componentWillUnmount() {
  console.log('autoComplete componentWillUnmount');
  //this.setState({loading:false});
 }

 renderInputComponent(inputProps) {
  const { classes, bundle, inputRef = () => {}, ref, ...other } = inputProps;
  var icon = null;
  if (bundle === 'playlists') {
   icon = <QueueMusic />;
  } else if (bundle === 'tracks' || bundle === 'media') {
   // EMBED: {{host}}/tamapi/forms/media/613?_format=json
   icon = <MusicNote />;
  } else if (bundle === 'rewards' || bundle === 'commerce_product') {
   icon = <CardGiftCard />;
  } else if (bundle === 'groups-group_membership' || bundle === 'user') {
   icon = <AccountCircle />;
  } else if (bundle === 'genres') {
   icon = <CategoryIcon />;
  } else if (bundle === 'groups') {
   icon = <GroupAdd />;
  } else {
   icon = <CompareArrows />;
  }

  return (
   <div className={classes.container}>
    {this.state.loading === false ? null :
     <div className={classes.overlay}><CircularProgress style={{margin:'5px auto'}} /></div>
    }
    <TextField
     fullWidth
     variant="outlined"
     InputProps={{
      autoComplete:'off',
      endAdornment:(
       <InputAdornment position="end">
        {icon}
       </InputAdornment>
      ),
      inputRef: node => {
       ref(node);
       inputRef(node);
      },
      classes: {
       input: classes.input,
      },
     }}
     {...other}
    />
   </div>
  );
 }

 renderSuggestion(suggestion, query, isHighlighted) {
  return (
   <AutoCompleteOption
    hasPlaylist={this.props.hasPlaylist}
    testPlay={value => this.props.testPlay(value, this.props.source)}
    isHighlighted={isHighlighted}
    value={suggestion}
    query={query}
    entry={this.props.entry}
    source={this.props.source}  />
  );
 }

 onSuggestionSelected(event, {suggestion}) {
  console.log('onSuggestionSelected', event.target, suggestion);
  this.handleSelection(suggestion);
 }

 checkDuplicates() {
  var has = {'audio':0, 'video':0, 'youtube':0};
  if (this.props.entry && this.props.entry.length > 0) {
   for(var i=0; i < this.props.entry.length; i++) {
    has[this.props.entry[i].target_bundle]++;
   }
  }
  if (this.props.media && this.props.media.entry) {
   for(i=0; i < this.props.media.length; i++) {
    has[this.props.media[i].target_bundle]++;
   }
  }

  console.log('media form sources', has, this.props);
  return has;
 }

 handleSelection(value) {
  if (this.props.source === 'tracks' || this.props.source === 'youtube') {
   var has = this.checkDuplicates();
   if (has[value.target_bundle] > 0) {
    return alert('You must first remove ' + value.target_bundle + ' to replace it');
   }
  } else if (this.props.entry) {
   if (this.props.entry.find(element => element.target_id === value.target_id || element.target_label === value.target_label)) {
    // return alert(value.target_label + ' is a duplicate ' + value.target_bundle);
   }
  }

  if (this.props.onSelected) {
   this.props.onSelected(value, this.props.field);
  }

  this.setState({loading:true, q:value.target_label, selected:value});

  // TODO: we should hoist all of this out. but the preloader
  var that = this;
  if (this.props.source === 'tracks') {
   if (!this.props.hasPlaylist) {
    console.log('track selected maybe for reward?', value);
   } else {
    API.Get('/tracks/' + value.nid).then((res) => {
     var has = this.checkDuplicates();
     let dups = res.data.field_media.find(el => has[el.target_bundle] > 0);
     if (dups) {
      alert('This track already has this source resource. You may delete yours first');
      return this.setState({loading:true, q:'', selected:{target_label:'', target_id:-1}});
     }
     that.props.populateTrack(res.data);
    }).catch((err) => {
     alert(API.getErrorMsg(err));
     that.setState({loading:false});
    });
   }
  } else if (this.props.source === 'youtube') {
   API.Post('/forms/media/youtube/add', value).then((res) => {
    that.setState({selected:res.data, loading:false, q:''});
    that.props.addMediaItem(res.data);
   }).catch((err) => {
    alert(API.getErrorMsg(err));
    that.setState({loading:false});
   });
  } else if (this.props.source === 'rewards') {
   API.Get('/marketplace/' + value.target_id).then((res) => {
    that.props.populateReward(res.data);
   }).catch((err) => {
    alert(API.getErrorMsg(err));
    that.setState({loading:false});
   });
  } else {
   console.log('type should be handled by onSelected: ' + this.props.source + ' - ' + value.target_id);
   that.setState({loading:false});
  }
 }

 getSuggestionValue(suggestion) {
  console.log("getSuggestionValue", suggestion);
  this.setState({selected:suggestion});
  return suggestion.target_label;
 }

 handleSuggestionsFetchRequested(value) {
  this.autocompleteSearch(value);
 }

 handleSuggestionsClearRequested(evt) {
  if (this.props.onSelected && this.state.q === '') {
   this.props.onSelected({target_id:-1, target_label:''}, this.props.field);
  }
  console.log('handleSuggestionsClearRequested', this.state.q);
 }

 changeQuery(event) {
  if (typeof event.target.value === 'undefined') {
   //console.log('Internal click', event.target);
   return false;
  }
  if (this.props.onInputChange) {
   this.props.onInputChange(event.target.value);
  }

  if (event.target.value.length < 1) {
   console.log('resetting as ', event.target);
   return this.setState({results:[], q:''});
  } else if (event.target.value === this.state.q) {
   return false;
  } else if (this.state.results.length === 0 && this.state.q.length > 1 && event.target.value.length > this.state.q.length) {
   this.setState({ q: event.target.value }); // no callback since it definitely won't match more
  } else {
   this.setState({ q: event.target.value }, () => {
    const q = this.state.q;
    if (q.length <= 1) {
     return false; // wasteful requests imo
    } else if (q.length < 5) {
     this.autocompleteSearchThrottled(this.state.q);
    } else {
     this.autocompleteSearchDebounced(this.state.q);
    }
   });
  }
 }

 autocompleteSearch(q, e) {
  if (typeof q !== 'string') return ''; // hits on { q: {value:''}, reason:'focus input'}
  const that = this;

  let url = this.props.apiurl.replace(':query',  encodeURIComponent(q));
  if (this.props.source === 'youtube') {
   if (q.toLowerCase().indexOf('https://') === 0) {
    let id = q.match(/.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#&?]*).*/);
    if (id && id[1].length === 11) {
     url =  `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${id[1]}&key=${Config.google.key}`;
    }
   }
   RemoteAPI.Get(url).then(res => {
    let results = [];
    for (var i in res.data.items) {
     var item = res.data.items[i];
     var id = (item.id.videoId) ? item.id.videoId : item.id;
     results.push({
      target_id : id,
      target_youtube : "https://www.youtube.com/watch?v="+id,
      target_label:item.snippet.title,
      target_bundle: 'youtube',
      thumb: item.snippet.thumbnails['default'].url
     });
    }
    console.log(results);
    that.setState({results:results});
   }).catch(err => {
    console.log(err);
    that.setState({results:[]});
   });
  } else {
   API.Get(url).then(res => {
    that.setState({results:res.data});
   }).catch(err => {
    console.log(err);
    that.setState({results:[]});
   });
  }
 }

 render() {

  const { classes } = this.props;

  const bundle = Form2Json.getBundle(this.props.field);

  return (
   <FormControl fullWidth >
    <Autosuggest
     renderInputComponent = {this.renderInputComponent}
     suggestions = {this.state.results}
     onSuggestionsFetchRequested = {(e) => this.handleSuggestionsFetchRequested(e)}
     /* alwaysRenderSuggest={true} */
     onSuggestionsClearRequested = {(e) => this.handleSuggestionsClearRequested(e)}
     getSuggestionValue = {(e) => this.getSuggestionValue(e)}
     onSuggestionSelected = {this.onSuggestionSelected}
     renderSuggestion={(suggestion, { query, isHighlighted })=>this.renderSuggestion(suggestion, query, isHighlighted)}
     inputProps={{
      name:this.props.field.field_name+'_label',
      bundle : bundle,
      classes,
      autoComplete:'off',
      placeholder: this.props.placeholder,
      value: this.state.q,
      onChange: (e) => this.changeQuery(e),
      InputLabelProps: {
       shrink: true,
      }
     }}
     theme={{
      container: classes.container,
      /* suggestionsContainerOpen: classes.suggestionsContainerOpen, */
      suggestionsList: classes.suggestionsList,
      suggestion: classes.suggestion,
     }}
     renderSuggestionsContainer={options => {
      var list = options.children;
      if (list == null) {
       if (this.state.q.length > 0 && (this.props.source === 'tracks' || this.props.source === 'youtube')) {
        list = <p style={{padding:5}}>No Results</p>;
       }
      }
      return (
       <Paper {...options.containerProps} square>
        {list}
       </Paper>
      );
     }
     }
    />
   </FormControl>
  );
 }
}


const styles = theme => ({
 container: {
  position: 'relative',
 },
 suggestionsContainerOpen: {
  position: 'absolute',
  zIndex: 999999,
  marginTop: theme.spacing(1),
  left: 0,
  right: 0,
  width:'100%'
 },
 suggestion: {
  display: 'block',
 },
 suggestionsList: {
  margin: 0,
  padding: 0,
  listStyleType: 'none',
 },
 divider: {
  height: theme.spacing(2),
 },
 overlay : {
  position:'absolute',
  width:'100%',
  height:'100%',
  backgroundColor:'rgba(0,0,0,.3)',
  textAlign:'center'
 }
});

AutoCompleteEntity.propTypes = {
 onInputChange : PropTypes.func,
 onSelected : PropTypes.func,
 placeholder: PropTypes.string,
 apiurl: PropTypes.string.isRequired,
 source: PropTypes.string.isRequired,
 index: PropTypes.number.isRequired,
 field: PropTypes.object.isRequired,
 entry: PropTypes.array
};


export default withRouter(withStyles(styles)(AutoCompleteEntity));
