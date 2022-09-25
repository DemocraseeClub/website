import React, {Component} from 'react';
import {withRouter} from 'react-router';
import {withStyles} from '@material-ui/core/styles';
import {debounce} from "throttle-debounce";
import Form2Json from '../../Util/Form2Json';
import MediaForm from '../../components/MediaForm';
import ImageUpload from '../../components/ImageUpload';
import OverlayLoader from '../../components/OverlayLoader';
import ChipSelector from '../../components/ChipSelector';
import AutoCompleteEntity from '../../components/AutoCompleteEntity';
import StartDate from '../../FormFields/StartDate';
import PropTypes from 'prop-types';
import {DatePicker, DateTimePicker, MuiPickersUtilsProvider} from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import Input from '@material-ui/core/Input';
import Select from '@material-ui/core/Select';
import Switch from '../../FormFields/Switch';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import DateRange from "@material-ui/icons/DateRange";
import AddCircle from "@material-ui/icons/AddCircle";
import RemoveCircle from "@material-ui/icons/RemoveCircle";
import LinkIcon from "@material-ui/icons/Link";
import AttachMoney from "@material-ui/icons/AttachMoney";
import Typography from "@material-ui/core/Typography";
import {pStyles} from "../../Util/ThemeUtils";

class FormWrapper extends Component {

  typeMap = {
   "string":this.renderStringField, // value
   "text_format":this.renderStringField, // value
   "text":this.renderStringField, // value
   "text_long":this.renderStringField, // value
   "text_with_summary":this.renderStringField, // value
   "string_long":this.renderStringField, // value
   "email":this.renderStringField, // value
   "password":this.renderStringField, // value
   "telephone":this.renderPhoneField, // value
   "float":this.renderIntField, // value
   'decimal':this.renderIntField, // value
   'integer':this.renderIntField, // value
   'boolean':this.renderBoolField, // value
   "select":this.renderListField, // value???
   "radios":this.renderListField, // value???
   "checkboxes":this.renderCheckboxesField, // value???
   "list_string":this.renderListField,  // value
   "datetime":this.renderDateField, // value
   "daterange":this.renderDateRangeField, // value / value2
   "fieldset":this.renderLinkField, // uri
   "link":this.renderLinkField, // uri
   "path":this.renderLinkField, // uri
   "color_field_type":this.renderColorField, // color, opacity
   'image':this.renderImgField, // target_id, fids, url
   'managed_file':this.renderImgField, // fid
   'entity_reference':this.renderEntityRefField, // target_id
   "voting_api_field":this.renderVotingField, // target_id
   "language":this.renderHiddenField, // value
   'hidden':this.renderHiddenField, // value/target_id
  };

  constructor(props) {
   super(props);
   this.updateTheme = this.updateTheme.bind(this);
   this.handleDateChange = this.handleDateChange.bind(this);
   this.updateThemeLag = debounce(500, this.updateTheme, this.updateTheme);
   this.state = { formstate:null};
  }

  componentDidMount() { // direct load: http://localhost:1337/forms/tracks/32434
   if (this.props.forms && this.props.forms.api) {
    this.initFormData();
   }
   if (!this.props.forms.apiurl) {
    // console.log('direct form load', this.props);
    this.props.loadForm(this.props.location.pathname + this.props.location.search, 'page');
   } else if (this.props.location.pathname + this.props.location.search !== this.props.forms.apiurl) {
    if (this.props.forms.apiurl !== '/otp/account_otp/send') {
     console.log('update form page load from link', this.props);
     this.setState({formstate:null});
     this.props.loadForm(this.props.location.pathname + this.props.location.search, 'page'); // only works for page, not dialog
    }
   }
  }

  componentDidUpdate(prevProps) {
   if (this.props.forms && this.props.forms.api) {
    if (this.state.formstate === null) {
     return this.initFormData();
    }
    if (prevProps.forms.api && this.props.forms.api.apiurl !== prevProps.forms.api.apiurl) {
     for (var f in this.state.formstate) {
      console.log('unset ' + f);
      this.setState({[f]: undefined});
     }
     this.initFormData();
    } else if (this.props.forms.api.node) {
     if (!prevProps.forms.api.node) {
      return this.initFormData(); // first new selection
     }
     if (this.props.forms.api.node.nid.length > 0) {
      if (!prevProps.forms.api || prevProps.forms.api.node.nid.length === 0) {
       return this.initFormData(); // first new selection
      } else if (this.props.forms.api.node.nid[0].value !== prevProps.forms.api.node.nid[0].value) {
       return this.initFormData(); // selection changed
      }
     }
     if (prevProps.forms.api.node) {
      if (JSON.stringify(prevProps.forms.api.node) !== JSON.stringify(this.props.forms.api.node)) {
       this.initFormData();
      }
     }
    }
   }
  }

  initFormData() {
   var data = [];
   var nested = {'fields':'entity', 'subform':'node'};
   const form = this.props.forms;
   for(var n in nested) {
    if (form.api[n]) {
     for(var f in form.api[n]) {
      var fieldname = form.api[n][f].field_name, type = form.api[n][f].type;
      var entry = (form.api[nested[n]] && typeof form.api[nested[n]][fieldname] !== 'undefined') ? form.api[nested[n]][fieldname] : [];
      var col = form.api[n][f]['data-propname'];
      if (entry.length > 0) {
       data[fieldname] = [...entry];
       while(data[fieldname].length > 0 && (typeof data[fieldname][data[fieldname].length - 1][col] === 'undefined' || data[fieldname][data[fieldname].length - 1][col] === null)) { // field_editors has [{target_id:4}, [], []];
        data[fieldname].splice(data[fieldname].length - 1, 1);
       }
       if (data[fieldname].length === 0) { // because we get [{uri:null}] on some links, which get stripped down to [] above
        data[fieldname][0] = {[col]:''};
       }
      } else if (type === 'color_field_type') {
       data[fieldname] = [{opacity:1}];
       if (fieldname === 'field_color_primary') {
        data[fieldname][0].color = this.props.theme.palette.primary.main.substr(1);
       } else if (fieldname === 'field_color_secondary') {
        data[fieldname][0].color = this.props.theme.palette.secondary.main.substr(1);
       } else if (fieldname === 'field_color_background') {
        data[fieldname][0].color = this.props.theme.palette.background.default.substr(1);
       } else if (fieldname === 'field_color_paper') {
        data[fieldname][0].color = this.props.theme.palette.background.paper.substr(1);
       } else {
        data[fieldname][0].color = 'CCCCCC';
       }
      } else {
       if (typeof data[fieldname] === 'undefined') data[fieldname] = [{}];
       let defaultValue = Form2Json.getDefaultValue(form.api[n][f], null, 0);
       if (typeof defaultValue === 'string' || typeof defaultValue === 'number') {
        // console.log(fieldname + ' has valid default ' + defaultValue);
        data[fieldname][0][col] = defaultValue;
       } else {
        // console.log(fieldname + ' has default ', defaultValue);
        data[fieldname][0][col] = (col === 'target_id') ? 0 : ''; // this is necessary for state, but will need to unset or ignored on submission. but then how do we empty a field intentionally?
       }
      }
      this.setState({[fieldname]:data[fieldname]}); // a bit flatter, but each field key is still an array of objects
     }
    }
   }

   // TODO: set timezone
   this.setState({formstate:Object.keys(data)});
   console.log("FORM INITIALIZED", data);
  }

  trackFieldChanges(val, field_name, index, propname) {
   var obj = {};
   obj[field_name] = JSON.parse(JSON.stringify(this.state[field_name]));
   if (typeof obj[field_name][index] === 'undefined') obj[field_name][index] = {};
   obj[field_name][index][propname] = val;
   // console.log("tracking changes", obj);
   this.setState(obj);
  }

  handleDateChange(val, field_name, index, propname) {
   if (val) val = val.format('YYYY-MM-DD HH:mm:ss'); // can be null on clear
   let obj = {};
   obj[field_name] = JSON.parse(JSON.stringify(this.state[field_name]));
   if (typeof obj[field_name][index] === 'undefined') obj[field_name][index] = {};
   obj[field_name][index][propname] = val;
   this.setState(obj);
  }

  handleSelection(value, field) {
   if (typeof value === 'object' && value.length > 0) {
    let obj = {}, field_name = field.field_name;
    obj[field_name] = [];
    for(let index=0; index < value.length; index++) {
     let val = (typeof value[index] === 'object' && value[index].target_id) ? value[index] : {target_id:value[index]};
     obj[field_name].push(val);
    }
    // console.log("UPDATING FORMWRAPPER ", obj)
    this.setState(obj);
   } else {
    this.trackFieldChanges(value.target_id, field.field_name, 0, 'target_id');
   }
  }

  mediaChanged(e) {
   console.log(e);
  }


  updateTheme(event) {
   event.stopPropagation();
   event.preventDefault();
   if (!event.target || !event.target.value) {
    return false;
   }

   const base = {
    primary: { main: this.props.theme.palette.primary.main },
    secondary: { main: this.props.theme.palette.secondary.main },
    background: {
     paper: this.props.theme.palette.background.paper,
     default: this.props.theme.palette.background.default
    }
   };

   const val = event.target.value, field_name = event.target.name;

   if (field_name === 'field_color_primary') {
    base.primary.main = val;
   } else if (field_name === 'field_color_secondary') {
    base.secondary.main = val;
   } else if (field_name === 'field_color_background') {
    base.background.default = val;
   } else if (field_name === 'field_color_paper') {
    base.background.paper = val;
   } else {
    return false;
   }

   this.trackFieldChanges(val.substr(1), field_name, 0, 'color');
   this.props.updateTheme(base);
   return false;
  }

  handleSubmit(evt) {
   evt.preventDefault();
   var report = evt.currentTarget.form.reportValidity();
   if (!report) {
    return alert('Invalid Form');
   }
   const fields = JSON.parse(JSON.stringify(this.state));
   delete fields['formstate'];

   const action = evt.currentTarget.form.getAttribute('action');

   if (this.props.forms.api.entity && fields.entity_id && typeof fields.entity_id.target_label === 'undefined') {
    fields.entity_id = this.props.forms.api.entity.entity_id; // should set target_id and target_label
   }

   if (this.props.forms.files) {
    for(let f in this.props.forms.files) {
     // if (!data[f]) data[f] = [];
     if (f === 'field_media') continue;
     // TODO check cardinality! against entity / node ?
     fields[f] = {target_id:this.props.forms.files[f].fid[0].value};
    }
   }

   if (action !== '/otp/account_otp/send' && this.props.me && this.props.me.profile) {
    if (!fields.title || fields.title.length < 1) {
     if (typeof fields.label === 'object' && fields.label.length === 1) {
      fields.title = fields.label; // ?
     } else if (fields.field_name && typeof fields.field_name[0] === 'object') {
      fields.title = fields.field_name;
     } else if (fields.entity_id && typeof fields.entity_id[0] === 'object' && fields.entity_id[0].target_label) {
      fields.title = [{value:fields.entity_id[0].target_label}]; // ??
     } else if (this.props.forms.api && this.props.forms.api.entity) {
      fields.title = (this.props.forms.api.entity.label) ? this.props.forms.api.entity.label : this.props.forms.api.entity.title; // autocompleted MP3 or editing MP3?
     } else {
      return this.props.showNotice('Please give this a title', 'error');
     }
    }
   }


   // ON NEW NODE
   // send state as is! (nullify target_ids!)
   if (this.props.forms.api.entity && this.props.forms.api.entity.type[0].target_id === "groups-group_node-tracks") {
    this.props.submitTrack(action, fields);
   } else {
    this.props.submitForm(action, fields);
   }
   return false;
  }

  renderIntField(field, entry, index) {
   if (field.field_name === 'field_status') {
    return this.renderBoolField(field, entry, index);
   }

   const inpProps = Form2Json.settingsToProps(field, entry, index);

   if (field.settings.prefix === '$') {
    inpProps.endAdornment = (<InputAdornment position="end"><AttachMoney /></InputAdornment>);
   } else if (field.settings.prefix) {
    inpProps.startAdornment = (<InputAdornment position="start">{field.settings.prefix}</InputAdornment>);
   } else if (field.settings.suffix) {
    inpProps.endAdornment = (<InputAdornment position="end">{field.settings.prefix}</InputAdornment>);
   }

   return (
    <Grid  key={field.field_name + '_' + index} item xs={6} sm={4} ><FormControl fullWidth >
     <InputLabel>{field.label}</InputLabel>
     <Input
      onChange={e => this.trackFieldChanges(e.currentTarget.value, field.field_name, index, field['data-propname'])}
      value={this.state[field.field_name][index][field['data-propname']]}
      style={{minWidth:'75%'}}
      inputProps={inpProps.inputProps}
      {...inpProps}
      type='number'
     />
     {field.description ? <FormHelperText>{field.description}</FormHelperText> : ''}
    </FormControl></Grid>);
  }

  renderStringField(field, entry, index) {

   const inpProps =Form2Json.settingsToProps(field, entry, index);
   if (field.type === 'text_with_summary') {
    inpProps.margin = "dense";
    inpProps.type = 'textarea';
    inpProps.multiline = true;
    inpProps.rows = 2;
   } else if (field.type === 'password') {
    inpProps.type = 'text';
   } else if (field.type === 'email') {
    inpProps.type = 'email';
   } else {
    inpProps.type = 'text';
   }

   return (
    <Grid key={field.field_name + '_' + index} item xs={12} sm={8} style={{maxWidth:'100%', flexGrow:1}} ><FormControl fullWidth >
     <InputLabel htmlFor={inpProps.id}>{field.label}</InputLabel>
     <Input
      onChange={e => this.trackFieldChanges(e.currentTarget.value, field.field_name, index, field['data-propname'])}
      value={this.state[field.field_name][index][field['data-propname']]}
      {...inpProps}
     />
     {field.description ? <FormHelperText>{field.description}</FormHelperText> : ''}
    </FormControl></Grid>);
  }

  renderPhoneField(field, entry, index) {

   const inpProps =Form2Json.settingsToProps(field, entry, index);
   inpProps.type = 'phone';

   return (
    <Grid key={field.field_name + '_' + index} item xs={6} sm={4} style={{maxWidth:'100%', flexGrow:1}} ><FormControl fullWidth >
     <InputLabel htmlFor={inpProps.id}>{field.label}</InputLabel>
     <Input
      {...inpProps}
      onChange={e => this.trackFieldChanges(e.currentTarget.value, field.field_name, index, field['data-propname'])}
      value={this.state[field.field_name][index][field['data-propname']]}
     />
     {field.description ? <FormHelperText>{field.description}</FormHelperText> : ''}
    </FormControl></Grid>);
  }


  renderColorField(field, entry, index) {

   const inpProps =Form2Json.settingsToProps(field, entry, index);
   inpProps.type = 'color';

   return (
    <Grid key={field.field_name + '_' + index} item xs={6} sm={4} ><FormControl fullWidth >
     <InputLabel>{field.label}</InputLabel>
     <Input
      value={'#'+this.state[field.field_name][index].color}
      onChange={this.updateThemeLag}
      {...inpProps}
     />
     {field.description ? <FormHelperText>{field.description}</FormHelperText> : ''}
    </FormControl></Grid>);
  }

  renderListField(field, entry, index) {

   const inpProps =Form2Json.settingsToProps(field, entry, index);

   let allowed = (!field.settings.allowed_values && field.widget && field.widget[0] && field.widget[0]['#options']) ?
    field.widget[0]['#options'] : field.settings.allowed_values;

   if (typeof inpProps.defaultValue === 'object' && inpProps.defaultValue.length === 0) inpProps.defaultValue = '';
   else if (typeof inpProps.defaultValue === 'object' && inpProps.defaultValue.length === 1) inpProps.defaultValue = inpProps.defaultValue[0];

   let cardinality = [];
   if (field.cardinality === 0 || field.cardinality > index + 1) {
    cardinality.push(<IconButton key={index+1} aria-label="Add" onClick={e => this.props.addFieldWidget(field.field_name, index+1)}><AddCircle /></IconButton>);
    if (index > 0) {
     cardinality.push(<IconButton key={index-1} aria-label="Remove" onClick={e => this.props.removeFieldWidget(field.field_name, index)}><RemoveCircle /></IconButton>);
    }
   }

   return (
    <Grid key={field.field_name + '_' + index} item xs={6} sm={4} ><FormControl   fullWidth >
     <InputLabel htmlFor={inpProps.id}>{field.label}</InputLabel>
     <Select
      native
      {...inpProps}
      onChange={e => this.trackFieldChanges(e.currentTarget.value, field.field_name, index, field['data-propname'])}
      value={this.state[field.field_name][index] ? this.state[field.field_name][index][field['data-propname']] : ''}
     >
      {Object.entries(allowed).map(arr => (
       <option key={arr[0]} value={(arr[0] === '_none') ? -1 : arr[0]}>
        {arr[1]}
       </option>
      ))}
     </Select>
     <FormHelperText>{field.description}</FormHelperText>
     <span>{cardinality} </span>
    </FormControl></Grid>);
  }

  renderDateRangeField(field, entry, index) {
   const inpProps = {required:true};
   inpProps.name = field.field_name;
   inpProps.label = field.label;
   inpProps.onError = console.log;
   inpProps.onChange = e => this.handleDateChange(e, field.field_name, index, 'value');
   inpProps.InputProps = {endAdornment:(<InputAdornment position="end"><DateRange /></InputAdornment>)}; // inputProps?
   if (entry.length === 0) {
    inpProps.disablePast = true;
    inpProps.disableFuture = false;
   }
   inpProps.format = 'L h:mm a';
   return (
    <Grid key={field.field_name + '_' + index} item xs={6} sm={4} >
     <FormControl style={{marginBottom:8}} >
      <MuiPickersUtilsProvider utils={MomentUtils}>
       <DateTimePicker {...inpProps}
        value={ (this.state[field.field_name][index].value) ? new Date(this.state[field.field_name][index].value) : new Date() } />
      </MuiPickersUtilsProvider>
     </FormControl>
     <FormControl>
      <MuiPickersUtilsProvider utils={MomentUtils}>
       <DateTimePicker {...Object.assign(inpProps, {
        label:'Ends',
        value : ((this.state[field.field_name][index].end_value) ? new Date(this.state[field.field_name][index].end_value) : null),
        onChange : (e) => this.handleDateChange(e, field.field_name, index, 'end_value')
       })} />
      </MuiPickersUtilsProvider>
     </FormControl>
     {field.description ? <FormHelperText>{field.description}</FormHelperText> : ''}
    </Grid>
   );
  }

  renderDateField(field, entry, index) {

   if (field.field_name === 'field_awarding_starts' || field.field_name === 'field_listening_starts' || field.field_name === 'field_rating_starts') {
    return <Grid key={field.field_name + '_' + index} item xs={6} sm={4} >
     <StartDate
      handleDateChange={this.handleDateChange}
      field={field} entry={entry} />
    </Grid>;
    // TODO: hide awarding_starts if listening || rating hasn't started
   }

   const inpProps = Form2Json.settingsToProps(field, entry, index);

   if (!inpProps.required) inpProps.clearable = true;

   inpProps.value= (this.state[field.field_name][index].value) ? new Date(this.state[field.field_name][index].value) : new Date();
   inpProps.label = field.label;
   inpProps.onError = console.log;
   inpProps.onChange = e => this.handleDateChange(e, field.field_name, 0, 'value');
   inpProps.InputProps = {endAdornment:(<InputAdornment position="end"><DateRange /></InputAdornment>)}; // inputProps?
   if (field.field_name === 'field_birthdate') {
    inpProps.disablePast = false;
    inpProps.disableFuture = true;
    inpProps.format = 'YYYY-MM-DD';
   } else {
    inpProps.format = 'L h:mm a';
   }

   return (
    <Grid key={field.field_name + '_' + index} item xs={6} sm={4} >
     <FormControl fullWidth >
      <MuiPickersUtilsProvider utils={MomentUtils} key={field.field_name + '_' + index}>
       {(field.field_name === 'field_birthdate') ?
        <DatePicker {...inpProps} />
        :
        <DateTimePicker {...inpProps} />
       }
      </MuiPickersUtilsProvider>
      {field.description ? <FormHelperText>{field.description}</FormHelperText> : ''}
     </FormControl></Grid>
   );
  }

  renderVotingField(field, entry, index) {
   return false;
  }

  renderEntityRefField(field, entry, index) {

   if (index > 0 && entry.length > 1 && (typeof entry[index].target_id === 'undefined' || entry[index].target_id === null)) {
    return false; // dont render empty placeholder widgets
   }
   let cardinality = [];
   if (field.cardinality === 0 || field.cardinality > index + 1) {
    cardinality.push(<IconButton key={index+1} aria-label="Add" onClick={e => this.props.addFieldWidget(field.field_name, index+1)}><AddCircle /></IconButton>);
    if (index > 0) {
     cardinality.push(<IconButton key={index-1} aria-label="Remove" onClick={e => this.props.removeFieldWidget(field.field_name, index)}><RemoveCircle /></IconButton>);
    }
   }
   let bundle = Form2Json.getBundle(field);
   let xs = 12, sm = 8;
   if (bundle === 'user') {
    xs = 6;
    sm = 4;
   }

   return (
    <Grid key={field.field_name + '_' + index} item xs={xs} sm={sm} >
     <AutoCompleteEntity
      onSelected={(e, field) => this.handleSelection(e, field)}
      apiurl={'/autocomplete/'+bundle+'/:query'}
      source={bundle} field={field} entry={entry} index={index} />
     {field.description ? <FormHelperText>{field.description}</FormHelperText> : ''}
     <span>{cardinality}</span>
    </Grid>
   );
  }

  renderCheckboxesField(field, entry, index) {
   return <Grid key={field.field_name + '_' + index} item xs={6} sm={4}>
    <InputLabel>{field.label}</InputLabel>
    <ChipSelector field={field} entry={entry} index={index}
     onChange={(selected) => this.handleSelection(selected, field)}
    />
    {field.description ? <FormHelperText>{field.description}</FormHelperText> : ''}
   </Grid>;
  }

  renderImgField(field, entry, index) {
   return (
    <Grid style={{position:'relative'}}  key={field.field_name + '_' + index} item xs={6} sm={4} >
     <InputLabel>{field.label}</InputLabel>
     <ImageUpload entry={entry} field={field} index={index}  />
     {field.description ? <FormHelperText>{field.description}</FormHelperText> : ''}
    </Grid>
   );
  }

  renderLinkField(field, entry, index) {

   const inpProps =Form2Json.settingsToProps(field, entry, index);

   return (
    <Grid  key={field.field_name + '_' + index} item xs={6} sm={4}><FormControl fullWidth   >
     <InputLabel htmlFor={inpProps.id}>{field.label}</InputLabel>
     <Input
      {...inpProps}
      type="url"
      endAdornment={
       <InputAdornment position="end">
        <LinkIcon />
       </InputAdornment>
      }
      onChange={e => this.trackFieldChanges(e.currentTarget.value, field.field_name, index, field['data-propname'])}
      value={this.state[field.field_name][index][field['data-propname']]}
     />
     {field.description ? <FormHelperText>{field.description}</FormHelperText> : ''}
    </FormControl></Grid>
   );
  }

  renderBoolField(field, entry, index) {
   return (
    <Grid  key={field.field_name + '_' + index} item xs={6} sm={4}>
     <Switch field={field} entry={entry} index={index}
      onChange={checked => this.trackFieldChanges(checked, field.field_name, index, field['data-propname'])} />
    </Grid>
   );
  }

  renderHiddenField(field, entry, index) {
   return (<input
    key={'hidden-'+field.field_name+'-'+index}
    type='hidden' name={field.field_name}
    value={this.state[field.field_name][index][field['data-propname']]}
   />);
  }

  buildFormKey() {
   if (!this.props.forms.api || !this.props.forms.api.node) return 'eform-new';

   let keyName = 'eform-' + this.props.forms.api.node.type[0].target_id + '-';

   keyName += (this.props.forms.api.node.nid && this.props.forms.api.node.nid.length > 0) ?
    this.props.forms.api.node.nid[0].value
    : (this.props.forms.api.node.uid && this.props.forms.api.node.uid.length > 0) ?
     this.props.forms.api.node.uid[0].target_id
     : 'unknown';

   return keyName;
  }

  handleDelete(form) {
   if (window.confirm('Are you sure you want to remove this?')) {
    this.props.submitDelete(form.apiurl.substring(0, form.apiurl.lastIndexOf('/')) + '/delete');
   }
  }

  goBack() {
   this.setState({formstate:null});
   this.props.history.goBack();
  }

  render() {
   const form = this.props.forms;
   if (this.state.formstate === null ) return <OverlayLoader />;
   if (!form.api) {
    if (form.loading === true) return <OverlayLoader />;
    else if (form.error) return <Typography variant='h2'>{form.error}</Typography>;
    else return 'error';
   }
   let f = null, field = null;
   if (form.apiurl.indexOf('/tracks/') > -1 && (!form.api.node.field_media || form.api.node.field_media.length === 0)) { // only show media form until node is selected or created
    field = Object.values(form.api.subform).find(x => x.field_name === 'field_media');
    return (<Grid container key={'empty-mediaform'} spacing={0} direction="row" alignContent="space-between" alignItems="stretch" >
     <MediaForm field={field} entry={[]} index={0} onChange={this.mediaChanged} dispatch={this.props.dispatch}  /></Grid>);
   }

   let inputs = [];
   let mediaform = false;
   let nested = {'fields':'entity', 'subform':'node'};
   for(let n in nested) {
    if (form.api[n]) {
     for(f in form.api[n]) {

      let prop = nested[n], fieldname = form.api[n][f].field_name;
      let entry = (form.api[prop] && typeof form.api[prop][fieldname] !== 'undefined') ? form.api[prop][fieldname] : [];

      if (fieldname === 'field_media') {
       mediaform = <Grid key={fieldname+'_'+0} spacing={0} container
        direction="row"
        justify="center"
        alignContent="space-between"
        alignItems="stretch" >
        <MediaForm field={form.api[n][f]} entry={entry} index={0} onChange={this.mediaChanged} dispatch={this.props.dispatch}  />
       </Grid>;
      } else {
       if (fieldname === 'revision_log' && form.apiurl.indexOf('/add') > 0) {
        continue; // no revision field when adding
       }
       let type = form.api[n][f].type;
       if (type === 'entity_reference' && form.api[n][f].widget && form.api[n][f].widget[0] && form.api[n][f].widget[0]['#type']) {
        type = form.api[n][f].widget[0]['#type']; // intentional override from entity_reference to checkboxes and other html elements
       }
       if (typeof this.typeMap[type] !== 'function') console.log("MISSING FIELD TYPE HANDLER " + type, form.api[n][f]);
       let component = false;
       if (entry.length === 0) {
        component = this.typeMap[type].call(this, form.api[n][f], [], 0);
        if (component) inputs.push(component);
        else console.log("FIELD TYPE HANDLER RETURNED EMPTY on empty entry: " + type, form.api[n][f]);
       } else {
        for(let c=0; c < entry.length; c++) {
         component = this.typeMap[type].call(this, form.api[n][f], entry, c);
         if (component) inputs.push(component);
         else console.log("FIELD TYPE HANDLER RETURNED EMPTY: " + type, form.api[n][f]);
         if (form.api[n][f].settings && form.api[n][f].settings.target_type === 'taxonomy_term') break; // only render first
        }
       }

      }
     }
    }
   }

   const formKey = this.buildFormKey();

   return (
    <Grid container direction={'column'} justify={'center'} style={{paddingLeft:'2%', paddingRight:'2%'}} >

     <form method='POST' action={form.apiurl} name={formKey} className={'taForm ' + this.props.forms.ctx + ' ' + this.props.classes.taForm} key={formKey} >

      {mediaform ? mediaform : null }
      <Grid
       container
       style={mediaform ? {marginTop:10, marginBottom:20} : {marginTop:20, marginBottom:20}}
       spacing={4}
       direction="row"
       justify="center"
       alignContent="space-between"
       alignItems="stretch"
      >
       {inputs}
      </Grid>
      <Grid
       container
       style={{marginTop:20, marginBottom:20}}
       spacing={4}
       direction="row"
       justify="space-around"
      >
       <Button
        variant="contained"
        margin="normal"
        color="primary"
        type='submit'
        disabled={form.loading === true}
        onClick={(e) => this.handleSubmit(e)} >Submit</Button>

       { this.props.forms.ctx === 'page' ?
        <Button
         variant="outlined"
         margin="normal"
         color="secondary"
         disabled={form.loading === true}
         onClick={(e) => this.goBack(e)} >Cancel</Button> :
        ''
       }



       { (form.api.entity && form.api.entity.id && form.api.entity.id.length > 0) ?  <Button
        variant="outlined"
        margin="normal"
        color="primary"
        disabled={form.loading === true}
        onClick={(e) => this.handleDelete(form)} >{form.apiurl.indexOf('/tracks/') > 0 ? 'Remove' : 'Delete'}</Button> : null }
      </Grid>

     </form>

    </Grid>
   );
  }
}

FormWrapper.propTypes = {
 theme: PropTypes.object.isRequired,
 forms : PropTypes.object.isRequired
};

export default withStyles(pStyles, {withTheme:true})(withRouter(FormWrapper));
