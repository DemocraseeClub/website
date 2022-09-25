import CommentsList from './CommentsList';
import {connect} from 'react-redux';

const mapStateToProps = (state, ownProps) => {
 const newProps = {json:ownProps.json, dispatch:ownProps.dispatch};
 const id = ownProps.json.get('id', 'value');
 if (typeof state.comments.threads[id] === 'undefined' || state.comments.threads[id].data.length === 0) {
  newProps.comments = false;
 } else {
  newProps.comments = state.comments.threads[id];
 }
 newProps.meid = (state.auth.me.profile) ? state.auth.me.profile.uid[0].value : 0;
 return newProps;
};

const mapDispatchToProps = dispatch => {
 return {
  dispatch
 };
};

export default connect(
 mapStateToProps,
 mapDispatchToProps
)(CommentsList);
