import {connect} from 'react-redux';
import MemberList from './MemberList';

const mapStateToProps = (state) => {
 var newState = {me:state.auth.me};
 newState.lists = state.lists;
 newState.location = state.router.location;
 return newState;
};

const mapDispatchToProps = dispatch => {
 return {
  dispatch
 };
};

export default connect(
 mapStateToProps,
 mapDispatchToProps
)(MemberList);
