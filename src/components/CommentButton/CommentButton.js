import React, {Component} from 'react';
import {withStyles} from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import CommentIcon from '@material-ui/icons/Comment';
import CommentAddIcon from '@material-ui/icons/AddComment';
import PropTypes from 'prop-types';
import DialogView from "../../Views/DialogView";
import CommentsList from "../CommentsList";
import {_showNotice} from "../../redux/formsReducer";

class CommentButton extends Component {

 constructor(props) {
  super(props);
  this.state = {showComments:(this.props.showComments === true), defaultValue:props.json.get('field_comments', 'comment_count')};
  this.showCommentBlock = this.showCommentBlock.bind(this);
 }

 showCommentBlock() {
  if (!this.props.profile) {
   // dispatch message
   this.props.dispatch(_showNotice('Please <a href="/login">login</a> to comment', 'error'));
  } else {
   this.setState({showComments:true});
  }

 }

 render() {
  if (this.state.showComments === true) {
   return (<DialogView
    title='Comments'
    closeDialog={e => this.setState({showComments:false})}
    content={this.props}
    component={CommentsList}
    open={this.state.showComments === true}
   />);
  }

  if (this.state.defaultValue === 0) {
   return (<IconButton aria-label="View / Write a comment" color={this.props.color}
    onClick={this.showCommentBlock} >
    <CommentAddIcon />
   </IconButton>);
  }

  return (
   <IconButton aria-label="View / Write a comment"
    onClick={this.showCommentBlock} size='small' style={{paddingRight:'17px'}}>
    <Badge badgeContent={this.state.defaultValue} color={this.props.color} classes={{badge:this.props.classes.badge}}>
     <CommentIcon />
    </Badge>
   </IconButton>
  );

 }
}


const styles = theme => ({
 badge : {
  fontSize:10,
  height:13,
  padding:'1px 3px 0 3px;',
  top: 11,
  right: -3
 }
});


CommentButton.defaultProps = {
 color:'primary',
};

CommentButton.propTypes = {
 color:PropTypes.string,
 json : PropTypes.object.isRequired
};

export default withStyles(styles)(CommentButton);
