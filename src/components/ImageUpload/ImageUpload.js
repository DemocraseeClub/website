import React, {Component} from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import ProgressLoading from '../../Components/ProgressLoading';
import ImageIcon from '@material-ui/icons/Camera';
import Config from '../../Config';
import {withStyles} from '@material-ui/core/styles';
import Drupal2Json from "../../Util/Drupal2Json";

class ImageUpload extends Component {

 constructor(props){
  super(props);
  this.state = {canvasdata: false};
  this.fileEl = React.createRef();
  this.handleChange = this.handleChange.bind(this);
  this.startBrowse = this.startBrowse.bind(this);
  // console.log(props.field, props.entry);
 }

 startBrowse(e) {
  this.fileEl.current.click();
 }

 componentWillUnmount() {
  if (this.state.canvasdata) {
   URL.revokeObjectURL(this.state.canvasdata);
  }
 }

 handleChange(event) {
  const data64 = URL.createObjectURL(event.target.files[0]);
  this.setState({canvasdata: data64});
  this.props.updateImageField(this.props.field, event.target);
 }

 makeAbsolute(url) { // because current rest endpoint doesn't handle normalization properly
  if (url.indexOf('http') === 0) return url;
  return Config.api.base + url;
 }

 render() {
  const {classes, entry, field, index } = this.props;
  const file = (!this.props.forms.files || typeof this.props.forms.files[field.field_name] === 'undefined')
   ? false
   : (typeof this.props.forms.files[field.field_name] === 'string')
    ? this.props.forms.files[field.field_name]
    : new Drupal2Json(this.props.forms.files[field.field_name]);

  return (
   <div onClick={this.startBrowse} >
    <input
     className={classes.fileInput}
     accept="image/*"
     onChange={this.handleChange}
     ref={this.fileEl}
     type="file"
    />
    {typeof file === 'object' ?
     <input
      className={classes.fileInput}
      type="number"
      data-propname='target_id'
      defaultValue={file.get('fid')}
     />
     : ''
    }

    <label>
     {this.props.label ? this.props.label : null}
     <IconButton component="span" className={classes.floatBtn} >
      <ImageIcon className={(this.state.canvasdata || (entry && entry[index])) ? classes.changeImage : classes.newImage} />
     </IconButton>
    </label>
    { typeof file === 'string' ?
     <ProgressLoading position='absolute' />
     : this.state.canvasdata ?
      <div className={classes.canvasdata} style={{ backgroundImage:'url('+this.state.canvasdata+')'}}>&nbsp;</div>
      : entry && entry[index] ?
       <div className={classes.canvasdata} style={{ backgroundImage:'url('+entry[index].url+')'}}>&nbsp;</div>
       : typeof file === 'object' ?
        <div className={classes.canvasdata} style={{ backgroundImage:'url('+this.makeAbsolute(file.get('uri', 'url'))+')'}}>&nbsp;</div>
        :
        ''
    }
   </div>
  );
 }
}


const styles = theme => ({
 canvasdata: {
  position:'absolute',
  zIndex:1,
  backgroundSize:'contain',
  backgroundRepeat:'no-repeat',
  backgroundPosition:'center right',
  width:'100%', height:'100%', left:0, top:0,
 },
 floatBtn : {
  position:'relative',
  zIndex:9,
  textAlign:'center',
  height:'100%'
 },
 fileInput : {
  display:'none'
 },
 newImage : {
  width:50, height:50, textAlign:'center'
 },
 changeImage : {
  width:50, height:50, opacity:.5
 }
});

ImageUpload.propTypes = {
 updateImageField : PropTypes.func.isRequired,
 index: PropTypes.number.isRequired,
 field: PropTypes.object.isRequired,
 entry: PropTypes.array // TODO: type check when empty
};

export default withStyles(styles)(ImageUpload);
