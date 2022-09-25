import FormWrapper from './FormWrapper';
import {connect} from 'react-redux';
import {
    _showNotice,
    addFieldWidget,
    changeFieldVal,
    loadForm,
    removeFieldWidget,
    submitDelete,
    submitForm,
    submitTrack,
    updateTheme
} from '../../redux/formsReducer';

const mapStateToProps = (state) => {
 var newState = {me: state.auth.me};
 newState.forms = state.forms;
 return newState;
};

const mapDispatchToProps = dispatch => {
 return {
  loadForm: (url, ctx) => {
   dispatch(loadForm(url, ctx));
  },
  submitForm: (data, url) => {
   dispatch(submitForm(data, url));
  },
  submitTrack: (data, url) => {
   dispatch(submitTrack(data, url));
  },
  showNotice: (msg, variant) => {
   dispatch(_showNotice(msg, variant));
  },
  addFieldWidget: (field_name, index) => { // TODO: setState inside FormWrapper
   dispatch(addFieldWidget(field_name, index));
  },
  removeFieldWidget: (field_name, index) => { // TODO: setState inside FormWrapper
   dispatch(removeFieldWidget(field_name, index));
  },
  submitDelete: (url) => {
   dispatch(submitDelete(url));
  },
  updateTheme: (palette) => {
   dispatch(updateTheme(palette));
  },
  changeFieldVal: (val, field_name, index, prop) => {
   dispatch(changeFieldVal(val, field_name, index, prop));
  }
 };
};


export default connect(
 mapStateToProps,
 mapDispatchToProps
)(FormWrapper);
