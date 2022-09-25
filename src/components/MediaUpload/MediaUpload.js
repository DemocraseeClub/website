import React, {Component} from 'react';
import OverlayLoader from '../../Components/OverlayLoader';
import Mp3Icon from '@material-ui/icons/CloudUpload';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import {withStyles} from '@material-ui/core/styles';
import AutoCompleteEntity from "../AutoCompleteEntity";
import FormControl from "@material-ui/core/FormControl";
import {requestDeposit} from "../../redux/walletReducer";

class MediaUpload extends Component {

 constructor(props) {
  super(props);
  this.state = {filedata: false, mediatype: false, mediaTitle: '',
   copyright_owner: this.props.profile.uid[0].value,
   ppp: (typeof window.store.getState().auth.gFeatures['media:ppp'] === 'number' ? window.store.getState().auth.gFeatures['media:ppp'] : 0.000) };

  this.fileEl = React.createRef();
  this.startBrowse = this.startBrowse.bind(this);
  this.handleChange = this.handleChange.bind(this);
  this.onTitleChange = this.onTitleChange.bind(this);
  this.onRateChange = this.onRateChange.bind(this);
  this.handleFaq = this.handleFaq.bind(this);
 }

 startBrowse(e) {
  this.fileEl.current.click();
 }

 componentWillUnmount() {
  if (this.state.filedata) {
   URL.revokeObjectURL(this.state.filedata);
  }
 }

 handleChange(event) {
  if (event.target.files.length === 0) return false; // cancelled change
  var file = event.target.files[0];
  var name = file.name.substring(0, file.name.lastIndexOf('.')); // remove extension
  name = name.replace(/[^a-zA-Z\d\s:\u00C0-\u00FF]/g, ' '); // remove all nonalphanumeric except space, color and latin equivalents
  name = name.replace('  ', ' '); // remove all nonalphanumeric except space, color and latin equivalents
  const data64 = URL.createObjectURL(file);
  this.setState({filedata: data64, mediaTitle: name, mediatype:file.type});
 }

 onTitleChange(e) {
  this.setState({mediaTitle: e.target.value});
 }

 onRateChange(e) {
  this.setState({ppp: parseFloat(e.target.value).toFixed(3)});
 }

 submitForm(currency) {
  if (this.state.mediaTitle.length === 0 || this.state.filedata === false) {
   alert('please provide a file and name');
   return false;
  }
  if (typeof window.store.getState().auth.gFeatures['media:ppp'] === 'number' && (!this.state.copyright_owner || this.state.copyright_owner < 1)) {
   alert('Who owns copyrights to this media? Search and select yourself if that is you');
   return false;
  }
  this.props.updateMediaField(
   this.fileEl.current,
   this.fileEl.name,
   this.state.mediaTitle,
   this.state.ppp,
   this.state.copyright_owner,
   currency
  );
 }

 handleFaq(evt, nid) {
  evt.preventDefault();
  this.props.loadFaq(nid, 'dialog');
  return false;
 }

 /* componentDidUpdate(prevProps) {
        // TODO: check changes in media entities
        if (this.props.forms.media && typeof this.props.forms.media[0] === 'object' && this.props.forms.media[0].target_label === this.state.mediaTitle) {
            this.setState({mediaTitle: '', filedata: false, mediatype: false})
        }
        console.log(prevProps, this.props);
    } */

 render() {
  const {classes, entry, field} = this.props;
  const isLoading = (this.props.forms.files && this.props.forms.files[field.field_name] === 'loading');
  const isArtist = (typeof this.props.profile.roles['artist'] === 'number') ? true : false;

  return (
   <div style={{display: 'flex', flexDirection: 'column', alignContent: 'center'}}>

    {(this.props.forms.files && this.props.forms.files[field.field_name] === 'loading') ?
     <OverlayLoader/>
     : ''}

    {

    }
    {isArtist === false ?
     <p>For quality control, we charge ₮5 TAC or $2 USD to register as an Artist. This is a one-time charge across all TAM Groups. Read our <a rel="canonical" href='https://api.trackauthoritymusic.com/sharer/faqs/100724'
      onClick={e => this.handleFaq(e, 100725)}>Artist Registry Policy</a> </p>
     : ''
    }

    {typeof window.store.getState().auth.gFeatures['media:ppp'] === 'number' ?
     <FormControl fullWidth>
      <Grid container wrap='nowrap' className={classes.mediaEl}>
       <Grid item xs={9}>
        <AutoCompleteEntity
         onSelected={(val, field) => this.setState({copyright_owner: val.target_id})}
         id="copyrightOwner"
         index={0}
         placeholder='Who owns the copyrights?'
         field={{
          field_name: 'copyright_owner',
          settings: {target_type: 'user'}
         }} entry={[{target_id:this.props.profile.uid[0].value, target_label:this.props.profile.field_name[0].value}]} apiurl={'/autocomplete/user/:query'} source={'user'}/>
       </Grid>
       <Grid item xs={3}>
        <TextField
         label="Pay per Play (PPP)"
         value={this.state.ppp}
         variant="outlined"
         required={true}
         InputProps={{
          autoComplete: 'off',
          startAdornment: (
           <InputAdornment position="start">$</InputAdornment>
          )
         }}
         onChange={this.onRateChange}
        />
       </Grid>
      </Grid>
     </FormControl>
     : ''
    }


    <Button color='primary'
     disabled={isLoading}
     className={classes.uploadBtn}
     startIcon={<Mp3Icon/>} onClick={this.startBrowse}
     variant='contained'>Browse (MP3s & MP4s)</Button>
    <input
     className={classes.fileInput}
     accept="audio/*,video/*"
     onChange={this.handleChange}
     ref={this.fileEl}
     name='file'
     type="file"
    />

    <Grid
     container
     spacing={1}
     className={classes.inlineBulletList}
    >
     <a rel="canonical" href='https://api.trackauthoritymusic.com/sharer/faqs/100724'
      onClick={e => this.handleFaq(e, 100661)}>Copyrights Policy</a>
     <span>&nbsp; &#x25CF; &nbsp;</span>
     <a rel="canonical" href='https://api.trackauthoritymusic.com/sharer/faqs/100723'
      onClick={e => this.handleFaq(e, 100723)}>Paid-Per-Play Policy</a>
    </Grid>

    {this.state.filedata ?
     <TextField
      className={classes.mediaEl}
      label="File Name"
      helperText="Add a unique filename from the overall Track title on the next page."
      value={this.state.mediaTitle}
      required={true}
      variant="outlined"
      onChange={this.onTitleChange}
     /> : ''
    }

    {(this.state.filedata && this.state.mediatype.indexOf('audio') > -1) ?
     <audio type={this.state.mediatype} src={this.state.filedata} className={classes.mediaEl} controls/>
     : (this.state.filedata && this.state.mediatype.indexOf('video') > -1) ?
      <video type={this.state.mediatype} src={this.state.filedata} className={classes.videoEl}
       controls/>
      : (entry && entry[0] && entry[0].filetype === 'audio') ?
       <audio type={entry[0].filetype} src={entry[0].url} className={classes.mediaEl} controls/>
       : (entry && entry[0] && entry[0].filetype === 'video') ?
        <video type={entry[0].filetype} src={entry[0].url} className={classes.mediaEl}
         controls/>
        : ''}


    {
     this.state.mediaTitle.length === 0 || this.state.filedata === false ? ''
      :
      (isArtist === true) ?
       <Button color='secondary' variant="contained"
        onClick={e=>this.submitForm('tac')}
        disabled={isLoading}>UPLOAD</Button> :
       <Grid
        container
        spacing={1}
        className={classes.inlineBulletList}>
        <Grid item>
         <Button color='secondary' variant="contained"
          onClick={e=>this.submitForm('tac')}
          disabled={isLoading || this.props.profile.wallet.tac < 5}>UPLOAD AND PAY ₮5 TAC</Button>
        </Grid>
        <Grid item>
         {this.props.profile.wallet.usd < 2 ?
          <Button color='secondary' variant="contained" onClick={e => this.props.dispatch(requestDeposit(2, 'Please deposit at least $' + (2-this.props.profile.wallet.usd))) } >DEPOSIT USD</Button>
          :
          <Button color='secondary' variant="contained"
           onClick={e=>this.submitForm('usd')}
           disabled={isLoading}>UPLOAD AND PAY $2 USD</Button>
         }
        </Grid>
       </Grid>
    }

   </div>
  );
 }
}


const styles = theme => ({
 filedata: {
  position: 'absolute',
  zIndex: 1,
  backgroundSize: 'contain',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center right',
  width: '100%', height: '100%', left: 0, top: 0,
 },
 fileInput: {
  display: 'none'
 },
 mediaEl: {
  width: '100%',
  minHeight: 20,
  margin: '8px 0'
 },
 uploadBtn: {
  width: '100%',
  textTransform: 'none',
  margin: '8px 0'
 },
 videoEl: {
  maxHeight: '90vh',
  maxWidth: '100%',
  minHeight: 250,
  margin: '8px 0'
 },
 inlineBulletList: {
  flexDirection: 'row-reverse',
  textAlign: 'center', justifyContent: 'center', width: '100%', marginTop: 20,
  letterSpacing: 1,
  fontWeight: 600,
  lineHeight: '26px',
  '& a': {
   textDecoration: 'none'
  }
 }
});


export default withStyles(styles)(MediaUpload);
