import {connect} from 'react-redux';
import {entityData} from '../../redux/entityDataReducer';

import EntityView from './EntityView';

const mapStateToProps = (state) => {
 var newState = {me:state.auth.me};
 newState.entity = state.entity;
 newState.lists = state.lists;
 newState.location = state.router.location;
 return newState;
};

const mapDispatchToProps = dispatch => {
 return {
  refreshEntity: url => {
   dispatch(entityData(url));
  },
  dispatch
 };
};

export default connect(
 mapStateToProps,
 mapDispatchToProps
)(EntityView);
