import ImageUpload from './ImageUpload';
import {connect} from 'react-redux';
import {updateImageField} from '../../redux/formsReducer';

const mapStateToProps = (state) => {
 const newState = {forms : {...state.forms}};
 return newState;
};

const mapDispatchToProps = dispatch => {
 return {
  updateImageField: (field, el) => {
   dispatch(updateImageField(field, el));
  }
 };
};


export default connect(
 mapStateToProps,
 mapDispatchToProps
)(ImageUpload);
