import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import CommentField from "../CommentField/CommentField";
import UserAvatar from "../UserAvatar";
import Drupal2Json from "../../Util/Drupal2Json";
import {deleteComment, editComment} from "../../redux/commentsReducer";

const styles = theme => ({
 commentItem: {
  backgroundColor: theme.palette.background.paper,
 },
 commentText: {
  borderRadius: 10,
  padding: 5,
  margin: '3px 0'
 },
 p1: {
  padding: 4
 },
 actionLine: {
  fontSize: 11
 },
 actionItem: {
  cursor: 'pointer',
  marginLeft: 10,
  fontWeight: 700,
  '&::before': {
   content: "&#x25CF;",
   fontSize: 9,
   fontWeight: 100,
   marginRight: 10
  }
 }
});


class CommentItem extends Component {

 constructor(props) {
  super(props);
  this.state = {reply:false};
  this.cjson = new Drupal2Json(props.comment);
  if (this.props.json.get('type', 'target_id') === 'groups-group_node-tracks') {
   this.apiurl = `/forms/group/${this.props.json.get('gid', 'target_id')}/playlists/${this.props.json.get('field_playlist_gc', 'target_id')}/tracks/${this.props.json.get('id', 'value')}/comments`;
  } else {
   this.apiurl = `/forms/group/${this.props.json.get('gid', 'target_id')}/playlists/${this.props.json.get('id')}/comments`;
  }
 }

 replyComment() {
  this.setState({reply:true});
 }

 editComment() {
  const cid = this.cjson.get('cid');
  this.props.dispatch(editComment(`${this.apiurl}/${cid}/edit`));
 }

 deleteComment() {
  const cid = this.cjson.get('cid');
  this.props.dispatch(deleteComment(`${this.apiurl}/${cid}/delete`));
 }

 render() {
  const {classes} = this.props;
  return (
   <Grid item container direction='row' justify='flex-start' alignContent='center'
    className={classes.commentItem}  style={{paddingLeft:this.cjson.get('pid', 'target_id') > 0 ? 25 : 0}}>
    <Grid item>
     <Link to={`/users/${this.cjson.get('uid', 'target_id')}/group/${this.props.json.get('gid', 'target_id')}`}>
      <UserAvatar variant='circle' size={30} data={this.props.comment.uid[0]}/>
     </Link>
    </Grid>
    <Grid item className={classes.commentText}>
     <Link style={{fontWeight: 700}}
      to={`/users/${this.cjson.get('uid', 'target_id')}/group/${this.props.json.get('gid', 'target_id')}`}>
      {this.cjson.get('uid', 'target_label')}
     </Link>
     <p style={{padding: 0, margin: 0}}>{this.cjson.get('comment_body')}</p>
     <div className={classes.actionLine}>{this.cjson.timeAgo('created')}
      { this.state.reply === false && !this.cjson.get('pid', 'target_id')  ? <span className={classes.actionItem} onClick={e => this.replyComment()}>Reply</span> : '' }
      {
       (this.cjson.get('uid', 'target_id') === this.props.meid) ?
        <span className={classes.actionItem}
         onClick={e => this.deleteComment()}>Delete</span>
        : ''
      }
     </div>
    </Grid>
    { this.state.reply === false ? '' :
     <Grid item xs={12} className={classes.commentText} style={{paddingLeft:20}}>
      <CommentField dispatch={this.props.dispatch} json={this.props.json} cid={this.cjson.get('cid')} />
     </Grid>
    }
   </Grid>
  );
 }
}

CommentItem.propTypes = {
 classes: PropTypes.object.isRequired,
 comment: PropTypes.object.isRequired,
 json: PropTypes.object.isRequired,
 dispatch: PropTypes.func.isRequired,
 meid:PropTypes.number.isRequired
};

export default withStyles(styles, {withTheme: true})(CommentItem);
