import React, {Component} from 'react';
import {withStyles} from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import FormControl from '@material-ui/core/FormControl';
import {postComment} from '../../redux/commentsReducer';
import InputAdornment from "@material-ui/core/InputAdornment";
import SendIcon from '@material-ui/icons/Send';

class CommentField extends Component {

 constructor(props) {
  super(props);
  this.state = { comment:''};
  this.handleSubmit = this.handleSubmit.bind(this);
  this.onChange = this.onChange.bind(this);
 }

 onChange(e) {
  let val = e.currentTarget.value;
  this.setState({comment:val});
 }

 handleSubmit() {
  const { json } = this.props;
  if (this.state.comment.length === 0) return false;
  const obj = {comment:this.state.comment};
  if (this.props.cid) obj.cid = this.props.cid;

  if (json.get('type', 'target_id') === 'groups-group_node-tracks') {
   this.props.dispatch(postComment(`/forms/group/${json.get('gid', 'target_id')}/playlists/${json.get('field_playlist_gc', 'target_id')}/tracks/${json.get('id', 'value')}/comments/add`, obj));
  } else {
   this.props.dispatch(postComment(`/forms/group/${json.get('gid', 'target_id')}/playlists/${json.get('id')}/comments/add`, obj));
  }
  this.setState({comment:''});
  return false;
 }

 render() {
  const { classes } = this.props;

  const inProps = {};
  if (this.state.comment.length > 0) {
   inProps.endAdornment = <InputAdornment className={classes.sendBtn} onClick={this.handleSubmit} position="end"><SendIcon size='small' color='primary' /></InputAdornment>;
  } else {
   inProps.startAdornment = <InputAdornment className={classes.sendBtn} position="start"><SendIcon size='small' style={{width: 10}} color={'disabled'} /></InputAdornment>;
  }

  return (
   <FormControl fullWidth  >
    <Input required={true} id='comment-text' type='textarea'
     {...inProps}
     value={this.state.comment}
     className={classes.input}
     onChange={this.onChange}
     placeholder={this.props.cid > 0 ? 'Reply' : 'Comment'}
     classes = {{input: classes.input}}
     multiline={true} />
   </FormControl>
  );
 }
}


const styles = theme => ({
 input: {
  backgroundColor: theme.palette.background.paper,
  paddingLeft:4, paddingRight:4,
  '&::placeholder': {
   fontSize:11
  }
 },
 sendBtn :{
  cursor:'pointer'
 }
});

export default withStyles(styles)(CommentField);
