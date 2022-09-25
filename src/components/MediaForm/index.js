import MediaForm from './MediaForm';
import {connect} from 'react-redux';

const mapStateToProps = (state) => {
 var newProps = {forms: {...state.forms}};
 newProps.profile = {...state.auth.me.profile};
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
)(MediaForm);
