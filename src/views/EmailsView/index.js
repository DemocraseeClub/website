import {connect} from 'react-redux';
import EmailsView from './EmailsView';

const mapStateToProps = (state) => {
 var newState = {me:state.auth.me};
 newState.emails = state.emails;
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
)(EmailsView);
