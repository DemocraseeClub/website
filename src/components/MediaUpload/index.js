import MediaUpload from './MediaUpload';
import {connect} from 'react-redux';
import {updateMediaField} from '../../redux/formsReducer';
import {loadFaq} from '../../redux/helpReducer';

const mapStateToProps = (state) => {
 const newState = {forms : {...state.forms}, meId:state.auth.me.profile.uid[0].value};
 return newState;
};

const mapDispatchToProps = dispatch => {
 return {
  updateMediaField: (el, filename, title, ppp, copyright_owner, currency) => {
   dispatch(updateMediaField(el, filename, title, ppp, copyright_owner, currency));
  },
  loadFaq: (id, ctx) => {
   dispatch(loadFaq(id, ctx));
  }
 };
};


export default connect(
 mapStateToProps,
 mapDispatchToProps
)(MediaUpload);
