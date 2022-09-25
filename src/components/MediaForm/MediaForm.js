import React, {Component} from 'react';
import {withStyles} from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import TamTrackSearch from '../TamTrackSearch';
import YoutubeSearch from '../YoutubeSearch';
import MediaUpload from '../MediaUpload';
import MediaRecorder from '../MediaRecorder';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import PlayIcon from '@material-ui/icons/PlayCircleFilled';
import OndemandVideo from '@material-ui/icons/OndemandVideo';
import PlayYtIcon from '../../images/yt-play.png';
import {getIdbySegment} from '../../Util/WindowUtils';
import Badge from '@material-ui/core/Badge';
import Typography from '@material-ui/core/Typography';
import {getParam} from '../../Util/WindowUtils';
import {withSnackbar} from "notistack";
import {deleteMedia} from '../../redux/formsReducer';

class MediaForm extends Component {
 constructor(props) {
  super(props);
  const has = this.checkDuplicates();
  if (has['audio'] > 0 && has['video'] > 0 && has['youtube'] > 0) {
   this.state = {sourceTab: -1, methodTab: 0};
  } else if (has['youtube'] > 0) {
   this.state = {sourceTab: 1, methodTab: 0};
  } else {
   this.state = {sourceTab: 0, methodTab: 0};
  }
  let requested = getParam('tab', props.forms.apiurl, '');
  console.log("requested: " + requested +  ' from ' + props.forms.apiurl);
  if (requested.length > 0) {
   if (requested === 'youtube') {
    this.state.sourceTab = 0;
    this.state.methodTab = 0;
   } else {
    this.state.sourceTab = 1;
    if (requested === 'upload') {
     this.state.methodTab = 1;
    } else if (requested === 'record') {
     this.state.methodTab = 2;
    } else {
     this.state.methodTab = 0;
    }
   }
  }

  this.changeTab = this.changeTab.bind(this);
 }

 checkDuplicates() {
  var has = {'audio': 0, 'video': 0, 'youtube': 0}, i = 0;
  if (this.props.entry && this.props.entry.length > 0) {
   for (i = 0; i < this.props.entry.length; i++) {
    has[this.props.entry[i].target_bundle]++;
   }
  }
  /* if (this.props.media && this.props.media.entry) {
            for (i = 0; i < this.props.media.length; i++) {
                has[this.props.media[i].target_bundle]++;
            }
        } */
  // console.log('media form sources', has, this.props);
  return has;
 }

 promptRemoveMedia() {
  // TODO:
 }

 changeTab(tabId, val) {
  this.setState({[tabId]: val});
  const tdata = getIdbySegment(document.location.pathname);
  if (tabId === 'sourceTab' && val === 0) {
   tdata.value = 'youtube';
  } else if (val === 0) {
   tdata.value = 'tamp3';
  } else if (val === 1) {
   tdata.value = 'upload';
  } else if (val === 2) {
   tdata.value = 'record';
  }
  tdata.verb = 'view';
  window.logUse.logEvent('mediatab', tdata);
 }

 getYouTubeID(url){
  // const youtube_regex = /^.*(youtu\.be\/|vi?\/|u\/\w\/|embed\/|\?vi?=|\&vi?=)([^#\&\?]*).*/
  url = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  return (url[2] !== undefined) ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
 }

 setCover(obj) { // WARN: should only ever be possible when editting existing nodes
  // return console.log(obj, this.props);

  let node = JSON.parse(JSON.stringify(this.props.forms.api.node));
  if (node.field_cover && node.field_cover.length > 0 && node.field_cover[0].url) {
   if (node.field_cover[0].url.indexOf("/tracks/covers/") > -1) {
    if (window.confirm('Do also you want to overwrite the existing cover?')) {
     node.field_cover = []; // else urls like /tracks/covers are generally better sources
    }
   }
  }
  node.field_yt_id = [{value:this.getYouTubeID(obj.target_youtube)}];
 }

 render() {
  const {classes, entry, ...passable} = this.props;

  var content = "";
  if (this.state.sourceTab === -1) {
   content = ''; // delete sources first
  } else if (this.state.sourceTab === 0) {
   content = <YoutubeSearch {...passable} entry={entry}/>;
  } else if (this.state.methodTab === 0) {
   content = <TamTrackSearch {...passable} entry={entry}/>;
  } else if (this.state.methodTab === 1) {
   content = <MediaUpload {...passable} entry={entry}/>;
  } else if (this.state.methodTab === 2) {
   content = <MediaRecorder {...passable} />;
  }

  const has = this.checkDuplicates();

  /*
        const json = new Drupal2Json(this.props.entity);
        const gid = json.get('gid', 'target_id');
        const pid = json.get('field_playlist_gc', 'target_id');
        const tid = json.get('id');
        */

  return (
   <div style={{width: '100%'}}>

    {this.props.forms.api.node && this.props.forms.api.node.field_media && this.props.forms.api.node.field_media.length > 0 ?
     <Typography variant='h4' style={{fontWeight: 600, fontSize: 12, margin: '15px 0 4px'}}>
                        Connect a source
     </Typography> : ''
    }

    <Tabs
     value={this.state.sourceTab}
     variant="fullWidth"
     centered={true}
     indicatorColor="primary"
     textColor="inherit"
     className={classes.tabs}>
     <Tab label={<><img alt="Play youtube" src={PlayYtIcon} color="secondary"
      style={{width: 24, height: 24}}/>Youtube</>}
     onClick={(e) => this.changeTab('sourceTab', 0)} className={classes.tabBtn}
     disabled={has['youtube'] > 0} aria-label="search youtube"/>
     <Tab label={<><PlayIcon color="primary"/>TAM</>} onClick={(e) => this.changeTab('sourceTab', 1)}
      className={classes.tabBtn} aria-label="connect with tam"/>
    </Tabs>
    {this.state.sourceTab === 0
     ? '' :
     <Tabs
      value={this.state.methodTab}
      variant="fullWidth"
      centered={true}
      indicatorColor="secondary"
      textColor="inherit"
      className={classes.subTabs}>
      <Tab label='Search' onClick={(e) => this.changeTab('methodTab', 0)} className={classes.tabBtn}
       disabled={has['audio'] > 0 && has['video'] > 0} aria-label="search tamp3"/>
      <Tab label="Upload" onClick={(e) => this.changeTab('methodTab', 1)} className={classes.tabBtn}
       disabled={has['audio'] > 0 && has['video'] > 0} aria-label="upload media"/>
      <Tab label="Record" onClick={(e) => this.changeTab('methodTab', 2)} className={classes.tabBtn}
       disabled={has['audio'] > 0 && has['video'] > 0} aria-label="capture media"/>
     </Tabs>
    }

    <div style={{paddingTop: 10, paddingBottom: 10}}>
     {content}
    </div>

    {entry && entry.length > 0 ?
     <React.Fragment>
      <Typography variant='h4' className={classes.helpTopBorder}>
                            Connected sources
      </Typography>
      <List
       component="nav"
       dense={true}
      >
       {entry.map((obj, i) => (
        <ListItem key={obj.target_id + '-' + i}>
         <ListItemAvatar>
          <IconButton aria-label={obj.target_bundle}
           onClick={(e) => this.props.dispatch(testPlay(obj, obj.target_bundle))}
           fontSize="large">
           {obj.target_bundle === 'audio' ?
            <PlayIcon color="primary"/> :
            obj.target_bundle === 'video' ?
             <OndemandVideo color="primary"/> :
             <img alt="Play youtube" src={PlayYtIcon} color="secondary"
              style={{width: 24, height: 24}}/>}
          </IconButton>

         </ListItemAvatar>

         {obj.target_bundle === 'youtube' && obj.target_youtube ?
          <ListItemAvatar style={{marginRight:15}}
           onClick={e => this.setCover(obj)}>
           <Badge badgeContent={'make cover'} color='secondary' classes={{badge:this.props.classes.badge}}>
            <img alt={'youtube thumb'}
             src={`https://img.youtube.com/vi/${this.getYouTubeID(obj.target_youtube)}/default.jpg`} />
           </Badge>
          </ListItemAvatar>
          : null
         }

         <ListItemText primary={obj.target_label}
          secondary={(obj.ppp && obj.ppp > 0.005) ? 'private' : (obj.target_bundle === 'audio') ? 'TAMp3' : obj.target_bundle}/>
         <ListItemSecondaryAction>
          <IconButton aria-label={obj.target_bundle}
           onClick={(e) => this.props.dispatch(deleteMedia(obj.target_id))} fontSize="large">
           <DeleteIcon/>
          </IconButton>
         </ListItemSecondaryAction>
        </ListItem>
       ))}
      </List>
     </React.Fragment> : ''
    }
   </div>
  );
 }
}


const styles = theme => ({
 paperBg: {
  backgroundColor: theme.palette.background.paper,
 },
 tabs: {
  /* borderCollapse:'collapse', */
  '& .MuiTab-root:first-child': {
   borderRadius: '8px 0 0 0'
  },
  '& .MuiTab-root:last-child': {
   borderRadius: '0 8px 0 0'
  }
 },
 subTabs: {
  /* borderCollapse:'collapse', */
  '& .MuiTab-root:first-child': {
   borderRadius: '0 0 0 8px'
  },
  '& .MuiTab-root:last-child': {
   borderRadius: '0 0 8px 0'
  }
 },
 tabBtn: {
  display: 'table-cell',
  boxSizing: 'border-box',
  minWidth: 'auto',
  borderStyle: 'groove',
  textTransform: 'none',
  borderWidth: .5,
  borderColor: theme.palette.primary.main,
  '&.Mui-selected': {
   transition: theme.transitions.create('width'),
   width:'69%',
   minWidth:'69%',
   color: theme.palette.primary.main,
  },
 },
 helpTopBorder: {
  fontWeight: 600, fontSize: 12, margin: '15px 0 4px',
  borderTop: '.25px solid ' + (theme.palette.type === 'light' ? theme.palette.grey[700] : theme.palette.grey[300]),
 },
 badge : {
  cursor:'pointer',
  fontSize:10,
  padding:'1px 3px 0 3px;',
  fontWeight:900
 }
});


MediaForm.propTypes = {
 onChange: PropTypes.func.isRequired,
 index: PropTypes.number.isRequired,
 field: PropTypes.object.isRequired,
 entry: PropTypes.array // TODO: type check when empty
};

export default withStyles(styles)(withSnackbar(MediaForm));
