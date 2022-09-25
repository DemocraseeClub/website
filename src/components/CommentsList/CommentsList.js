import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import {loadComments} from "../../redux/commentsReducer";
import CommentField from "../CommentField/CommentField";
import CommentItem from "../CommentItem/CommentItem";

class CommentsList extends Component {

 componentDidMount() {
  const {json} = this.props;
  if (this.props.meid > 0) {
   // TODO: check group:field_visibility_comments
   if (!this.props.comments && json.get('field_comments', 'comment_count') > 0) {
    if (json.get('type', 'target_id') === 'groups-group_node-tracks') {
     this.props.dispatch(loadComments(`/group/${json.get('gid', 'target_id')}/playlists/${json.get('field_playlist_gc', 'target_id')}/tracks/${json.get('id', 'value')}/comments`, 'dialog'));
    } else {
     this.props.dispatch(loadComments(`/group/${json.get('gid', 'target_id')}/playlists/${json.get('id')}/comments`, 'dialog'));
    }
   }
  }
 }

 render() {
  const { comments } = this.props;
  if (comments === false || comments.data.length === 0) {
   return <CommentField dispatch={this.props.dispatch} json={this.props.json} />;
  }

  return (
   <Grid container className={this.props.classes.commentBlock} direction="column" >
    <Grid item className={this.props.classes.p1}>
     <CommentField dispatch={this.props.dispatch} json={this.props.json} />
    </Grid>
    {this.props.meid > 0 && comments.data.map( (c, delta) => <CommentItem meid={this.props.meid} key={delta} json={this.props.json} dispatch={this.props.dispatch} comment={c} /> )}
   </Grid>
  );
 }
}

CommentsList.propTypes = {
 classes: PropTypes.object.isRequired,
 json: PropTypes.object.isRequired,
 dispatch:PropTypes.func.isRequired,
 comments:PropTypes.any,
 meid:PropTypes.number.isRequired
};


const styles = theme => ({
 commentBlock : {

 },
 p1 : {
  padding:4
 }
});


export default withStyles(styles, {withTheme: true})(CommentsList);
