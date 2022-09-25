import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Form2Json from '../../Util/Form2Json';
import SwitchUI from '@material-ui/core/Switch';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';

class Switch extends Component {

 constructor(props) {
  super(props);
  let defaultValue = Form2Json.getDefaultValue(props.field, props.entry, 0);
  if (defaultValue === true || parseInt(defaultValue, 0) > 0) {
   this.state = {checked : true};
  } else {
   this.state = {checked : false};
  }
 }

 handleChange(e) {
  if (e.target.checked === true) {
   this.setState({checked:true});
  } else {
   this.setState({checked:false});
  }
  this.props.onChange(e.target.checked === true ? 1 : 0);
 }

 render() {
  const {field, entry, index} = this.props;
  var inputProps = Form2Json.settingsToProps(field, entry, index);

  return (
   <FormControl fullWidth   >
    <FormControlLabel
     control={
      <SwitchUI
       checked={this.state.checked}
       {...inputProps}
       onChange={(e) => this.handleChange(e)}
      />
     }
     label={this.state.checked === true ? field.label : 'Not ' + field.label}
    />
    {field.description ? <FormHelperText>{field.description}</FormHelperText> : ''}
   </FormControl>
  );
 }
}

Switch.propTypes = {
 onChange : PropTypes.func.isRequired,
 index: PropTypes.number.isRequired,
 field: PropTypes.object.isRequired,
 entry: PropTypes.array // TODO: type check when empty
};

export default Switch;
