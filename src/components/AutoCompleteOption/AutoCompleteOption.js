import React, {Component} from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import {withStyles} from '@material-ui/core/styles';
import PlayIcon from '@material-ui/icons/PlayCircleFilled';
import PlaylistAdd from '@material-ui/icons/PlaylistAdd';

class AutoCompleteOption extends Component {

 // state = { expanded: false, tabId:'top_tracks', settingsOpen:false };

 render() {
  const { isHighlighted, classes, value } = this.props;

  return (
   <MenuItem selected={isHighlighted} component="div" className={classes.container} >
    {this.props.hasPlaylist ? <PlaylistAdd aria-label='Add to Playlist' style={{marginRight:5}}/> : ''}
    {value.thumb ? <img alt='track cover' className={classes.thumb} src={value.thumb} /> : null}
    <div className={classes.title}>{value.target_label}</div>
    {this.props.source === 'tracks' || this.props.source === 'youtube' ?
     <IconButton aria-label='Play Snippet' style={{padding:'2px'}} size='small' onClick={ (e) => { e.stopPropagation(); e.preventDefault(); this.props.testPlay(value); return false; } } >
      <PlayIcon />
     </IconButton>
     : null}
   </MenuItem>
  );
 }
}



const styles = theme => ({
 container: {
  position: 'relative',
  display:'flex',
  padding:'2px',
  width:'100%',
  justifyContent:'space-between',
  alignContent:'center',
  alignItems:'center'
 },
 title: {
  padding:'1px 0',
  overflow: 'hidden',
  width:'100%',
  wordWrap:' break-word',
  overflowWrap: 'break-word',
  textShadow: '0px 0px 2px ' + theme.palette.action.active
 },
 thumb : {
  width:'60px'
 },
 floatThumb : {
  position:'absolute',
  top:0, left:0,
  width:'60px', maxHeight:'50px'
 }
});


export default withStyles(styles)(AutoCompleteOption);
