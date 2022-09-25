import React, {Component} from 'react';
import PropTypes from 'prop-types';
import MenuItem from '@material-ui/core/MenuItem';
import Chip from '@material-ui/core/Chip';
import Input from '@material-ui/core/Input';
import Select from '@material-ui/core/Select';
import {withStyles} from '@material-ui/core/styles';


const MenuProps = {
 PaperProps: {
  style: {
   maxHeight: 48 * 4.5 + 8,
   width: 250,
  },
 },
};

class ChipSelector extends Component {

 constructor(props) {
  super(props);
  let selected = [];
  if (this.props.entry) {
   this.props.entry.map( obj => (
    selected.push(obj.target_id.toString()) // select clicks return [88, "88"] throwing duplication error, so we handle everything as a string
   ));
  }
  this.state = { selected:selected };
 }

 getCheckboxStyles(tid, selected) {
  return {
   fontWeight:selected.join(' ').indexOf(tid) === -1 ? 400 : 900, // WARN: 102 will match 1024
  };
 }

 getTidLabel(tid) {
  const options = this.props.field.widget[0]['#options'];
  for (var id in options) {
   if (parseInt(id, 0) === parseInt(tid, 0)) {
    return options[tid];
   }
  }
 }

 handleCheckboxChange(event) {
  let options = event.target.value;
  this.setState({selected:options});
  this.props.onChange(options);
 }

 render() {
  const { field, index } = this.props;
  var options = [];

  for (var tid in field.widget[0]['#options']) {
   options.push(<MenuItem key={tid} value={tid} style={this.getCheckboxStyles(tid, this.state.selected)} >
    {field.widget[0]['#options'][tid]}
   </MenuItem>);
  }

  return (
   <Select
    multiple
    fullWidth
    name={field.field_name}
    value={this.state.selected}
    onChange={(e) => this.handleCheckboxChange(e)}
    input={<Input id={'multiselect-' + field.field_name + '-' + index} />}
    style={{width:'100%'}}
    placeholder={field.label}
    renderValue={selected => {
     if (selected.length === 0 || selected === '') return '<em>' + field.label + '</em>';
     return (
      <div className={this.props.classes.chips}>
       {this.state.selected.map( tid => (
        <Chip key={tid} label={this.getTidLabel(tid)} className={this.props.classes.chip} />
       ))}
      </div>
     );
    }}
    MenuProps={MenuProps} >
    {options}
   </Select>
  );
 }
}


const styles = theme => ({
 chips: {
  display: 'flex',
  flexWrap: 'wrap',
 },
 chip: {
  margin: 2,
 }
});

ChipSelector.propTypes = {
 onChange : PropTypes.func.isRequired,
 index: PropTypes.number.isRequired,
 field: PropTypes.object.isRequired,
 entry: PropTypes.array // TODO: type check when empty
};

export default withStyles(styles)(ChipSelector);
