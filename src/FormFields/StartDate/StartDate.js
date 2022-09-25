import React, {Component} from 'react';
import PropTypes from 'prop-types';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import {DateTimePicker, MuiPickersUtilsProvider} from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import moment from 'moment';
import DateRange from "@material-ui/icons/DateRange";
import Form2Json from '../../Util/Form2Json';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';

class StartDate extends Component {

 constructor(props) {
  super(props);
  if (typeof props.field.default_value === 'object' && props.field.default_value !== null && typeof props.field.default_value[0] !== 'undefined' && typeof props.field.default_value[0]['default_date'] !== 'undefined' && props.field.default_value[0]['default_date'] === 'now') {
   this.state = {datetype:'now', value: new Date() };
  } else {
   let defaultValue = Form2Json.getDefaultValue(props.field, props.entry, 0);
   if (defaultValue) {
    this.state = {datetype:'datetime', value:new Date(defaultValue)}; //  has value: datetime
   } else {
    this.state = {datetype: 'now'}
   }
  }

  this.handleRelativeDate = this.handleRelativeDate.bind(this);
 }

 handleChange(e) {
  this.setState({value: e});
  this.props.handleDateChange(e, this.props.field.field_name, 0, 'value');
 }


 handleRelativeDate(e) {
  const datetype = e.currentTarget.value;
  if (datetype === 'pool') {
   this.setState({datetype:datetype, value:null});
   this.props.handleDateChange(null, this.props.field.field_name, 0, 'value');
  } else {
   this.setState({datetype:datetype, value:new Date()});
   this.props.handleDateChange(moment(), this.props.field.field_name, 0, 'value');
  }
 }

 render() {
  const {field, entry} = this.props;

  const inpProps = Form2Json.settingsToProps(field, entry, 0);

  if (this.state.datetype !== 'datetime') {
   return <FormControl fullWidth key={this.props.field.field_name + '-'+this.state.datetype} >
    <InputLabel htmlFor={inpProps.id}>{field.label}</InputLabel>
    <Select native onChange={this.handleRelativeDate} value={this.state.datetype}>
     <option value=''></option>
     {this.props.field.field_name !== 'field_awarding_starts' ? <option value='now'>Immediately</option> : ''}
     <option value='datetime'>A specific date / time</option>
    </Select>
    {field.description ? <FormHelperText>{field.description}</FormHelperText> : ''}
   </FormControl>;
  }


  if (!inpProps.required) inpProps.clearable = true;
  inpProps.value= this.state.value;
  if (!entry || entry.length === 0) {
   inpProps.disablePast = true;
  }
  inpProps.label = field.label;
  inpProps.onError = console.log;
  inpProps.onChange = e => this.handleChange(e);
  inpProps.InputProps = {endAdornment:(<InputAdornment position="end"><DateRange /></InputAdornment>)};
  inpProps.format = 'L h:mm a';

  return (
   <FormControl fullWidth key={this.props.field.field_name + '-'+this.state.datetype} >
    <MuiPickersUtilsProvider utils={MomentUtils} >
     <DateTimePicker {...inpProps} />
    </MuiPickersUtilsProvider>
    <FormHelperText><u onClick={e => this.setState({datetype:'now'})}>Set relative date</u> &nbsp; &nbsp; {field.description ? field.description : ''}</FormHelperText>
   </FormControl>
  );
 }
}

Image.propTypes = {
 handleDateChange : PropTypes.func.isRequired,
 field: PropTypes.object.isRequired,
 entry: PropTypes.array.isRequired // TODO: type check when empty
};

export default StartDate;
