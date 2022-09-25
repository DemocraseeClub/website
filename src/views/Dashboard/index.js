import {connect} from 'react-redux';
import {listData} from '../../redux/listDataReducer';
import Dashboard from './Dashboard';
import {withSnackbar} from 'notistack';

const mapStateToProps = (state) => {
 var newState = {me:state.auth.me};
 newState.lists = state.lists;
 newState.location = state.router.location;
 return newState;
};

const mapDispatchToProps = dispatch => {
 return {
  refreshList: url => {
   dispatch(listData(url));
  },
  dispatch
 };
};

export default connect(
 mapStateToProps,
 mapDispatchToProps
)(withSnackbar(Dashboard));
