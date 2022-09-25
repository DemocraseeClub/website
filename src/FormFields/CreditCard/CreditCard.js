import React, {Component} from 'react';
import {withStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Checkbox from '@material-ui/core/Checkbox';

import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
import OverlayLoader from '../../Components/OverlayLoader';
// import WalletIcon from '@material-ui/icons/AccountBalanceWallet';
import {Link} from 'react-router-dom';
import {getIdbySegment} from "../../redux/authActions";
import Typography from "@material-ui/core/Typography";


class CreditCard extends Component {

 constructor(props) {
  super(props);
  // GET TEST CARDS HERE: https://cloud9paymentgateway.com/w/index.php?title=TSYS_Test_Account
  this.state = {amountWithdraw:false, amountDeposit:false, paymethod:0, errors:{}, storeToken:true};
 }

 handleFaq(evt, nid) {
  evt.preventDefault();
  this.props.loadFaq(nid, 'dialog');
  return false;
 }

 componentDidMount() {
  if (!this.props.me || !this.props.me.profile) {
   document.location.href = '/login';
  }
  if (this.props.wallet.cartValue) {
   this.setState({amountDeposit:this.props.wallet.cartValue});
  }
  this.props.checkWalletBalance();
 }

 componentDidUpdate(prevProps) {
  if (!this.props.wallet.balance.paymethods || this.props.wallet.balance.paymethods.length === 0) return;
  if (this.props.wallet.balance.paymethods !== prevProps.wallet.balance.paymethods) {
   this.setState({paymethod:this.props.wallet.balance.paymethods[0].id});
  }
  if (this.props.wallet.reason && (!prevProps.wallet.reason || prevProps.wallet.reason !== this.props.wallet.reason) ) {

   const tdata = getIdbySegment(document.location.pathname); // only works when ctx is dialog. should be the case for reason prompts
   if (!tdata.pid && this.props.wallet.gc) {
    tdata.tid = this.props.wallet.gc.get('id');
    tdata.pid = this.props.wallet.gc.get('field_playlist_gc', 'target_id');
    tdata.gid = this.props.wallet.gc.get('gid', 'target_id');
   } else if (!tdata.gid && this.props.me.brandId) {
    tdata.gid = this.props.me.brandId;
   }
   tdata.verb = 'requested';
   tdata.value = this.props.wallet.cartValue;
   tdata.currency = 'USD';
   tdata.dom_ref = this.props.wallet.ctx;
   tdata.uid = this.props.me.profile.uid[0].value;
   window.logUse.logEvent('transaction', tdata);
  }
 }

 handleSubmit(formId) {
  if (formId === 'withdrawForm') {
   return this.props.makeWalletWithdrawal({amount:this.state.amountWithdraw, currency:'USD', paymethod:this.state.paymethod});
  }
  var payment = {};
  if (this.state.paymethod > 0) {
   payment['id'] = this.state.paymethod;
   return this.props.makeWalletDeposit({paymethod:payment, amount:this.state.amountDeposit, currency:'USD'});
  }
  payment = this.formToObject('payMethodForm');
  if (payment !== false) {
   var address = this.formToObject('billingAddressForm');
   if (address !== false) {
    this.props.makeWalletDeposit({paymethod:payment, address:address, amount:this.state.amountDeposit, currency:'USD'});
   }
  }
 }

 formToObject(formId) {
  var form = document.forms[formId], obj = {}, errors = {}, hasErrors = false;
  for(var i=0; i < form.length; i++) {
   if (typeof form[i] !== 'object' || typeof form[i].name !== 'string') continue;
   if (form[i].checkValidity() === false) {
    errors[form[i].name] = form[i].validationMessage;
    hasErrors = true;
   } else {
    obj[form[i].name] = form[i].value;
   }
  }
  this.setState({errors:errors});
  return hasErrors === false ? obj : false;
 }

 handleAmountChange(e) {
  const obj = {};
  const val = parseFloat(e.target.value);
  if (val > 0) {
   if (e.target.name === 'amountWithdraw') {
    obj[e.target.name] = Math.min(this.props.wallet.balance.usd, val);
   } else {
    obj[e.target.name] = val;
   }
  } else {
   obj[e.target.name] = false;
  }
  this.setState(obj);
 }

 render() {
  if (!this.props.me || !this.props.me.profile) return 'login';
  if (!this.props.wallet || !this.props.wallet.balance) return 'loading';

  const { classes} = this.props;

  return (
   <div className={classes.container} >
    {(this.props.wallet.loading === true) ? <OverlayLoader  /> : null }
    {this.props.wallet.ctx !== 'dialog' ? <Typography variant='h1' style={{margin:'5px 0 10px 0', textAlign:'right'}}>My Wallet</Typography> : ''}
    <div className={classes.formBlock}>
     <Grid container justify='space-between'>
      <Grid item><Typography variant='h3'>&#x20AE;.A.Credibility</Typography></Grid>
      <Grid item className={classes.tacVal}><Typography variant='h3' ><sup>&#8366;</sup>{this.props.wallet.balance.tac}</Typography></Grid>
     </Grid>
     <p style={{textAlign:'center'}}>
                &#x20AE;.A.Credibility is our official currency. You earn it through curating playlists. You can spend it on music, and bet it for dollars
     </p>
     {this.props.wallet.balance.tac > 0 ? <Link to='/wallet/activity'><Button>View Earnings</Button></Link> : '' }
    </div>
    <div className={classes.formBlock}>
     <Grid container justify='space-between'>
      <Grid item><Typography variant='h3'>US Dollars ($)</Typography></Grid>
      <Grid item className={classes.usdVal}>
       <Typography variant='h3'><sup>$</sup>{this.props.wallet.balance.usd}</Typography>
       <Typography variant='h6'>Holding</Typography>
      </Grid>
     </Grid>
     <ul>
      <li>Make a deposit to pay for TAM upgrades, subscriptions, and marketplace purchases</li>
     </ul>
     {this.props.wallet.balance.usd > 0 || this.props.wallet.balance.preauth > 0
      ? <Link to='/wallet/activity' ><Button>View Transactions</Button></Link> : ''}
    </div>

    {this.props.wallet.reason ? <p className={classes.prompt}>{this.props.wallet.reason}</p> : ''}

    {this.props.wallet.balance.paymethods > 0 ?
     <div className={classes.formBlock}>
      <Select id='paymethod' name='paymethod'
       value={this.state.paymethod}
       onChange={(e) => this.setState({'paymethod':parseInt(e.target.value)})}
      >
       <MenuItem value='0'>Enter a new payment method</MenuItem>
       {this.props.wallet.balance.paymethods.map((o, i)=> (
        <MenuItem key={i} value={o.id}>{o.brand + ' ' + o.cardname}</MenuItem>
       ))}
      </Select>
     </div>
     : ''
    }
    <Grid container justify='space-around' >
     <Grid item>
      <FormControl fullWidth={true} style={{marginBottom:8}}>
       <InputLabel htmlFor='amountDeposit'>Amount to Deposit ($)</InputLabel>
       <Input required={true} value={this.state.amountDeposit} onChange={e => this.handleAmountChange(e)} name='amountDeposit' id='amountDeposit' type='number' margin='dense' />
       <FormHelperText>Read <a rel="canonical" href='https://api.trackauthoritymusic.com/sharer/faqs/100665' onClick={e => this.handleFaq(e, 100665)}>Wallet Withdrawal Policy</a></FormHelperText>
      </FormControl>
     </Grid>
     {
      this.props.wallet.balance.usd > 0 ?
       <Grid item>
        <FormControl fullWidth={true} style={{marginBottom:8}}>
         <InputLabel htmlFor='amountWithdraw'>Amount to Withdraw</InputLabel>
         <Input required={true} value={this.state.amountWithdraw} onChange={e => this.handleAmountChange(e)} name='amountWithdraw' id='amountWithdraw' type='number' margin='dense' />
         <FormHelperText>$ USD</FormHelperText>
        </FormControl>
       </Grid> : null
     }
    </Grid>

    {this.props.wallet.error ? <p style={{color:'red'}}>{this.props.wallet.error}</p> : ''}

    <div className={classes.formBlock} style={(this.state.paymethod === 0 && this.state.amountDeposit !== false) ? {display:'block'} : {display:'none'}}>
     <Typography variant='h2' className={classes.sectionHead}>Charge Card</Typography>
     <form name="payMethodForm">
      <FormControl style={{marginRight:5}}>
       <InputLabel htmlFor='cardHolder'>Name</InputLabel>
       <Input required={true} id='cardHolder' name='ccname' inputProps={{"autoComplete":"cc-name"}} error={typeof this.state.errors['ccname'] === 'string'} type='text' margin='dense' />
      </FormControl>
      <FormControl style={{marginRight:5}}>
       <InputLabel htmlFor='cardNumber'>Card Number</InputLabel>
       <Input
        required={true}
        error={typeof this.state.errors['number'] === 'string'}
        name='cardnumber'
        type='text'
        id='cardNumber'
        inputProps={{"autoComplete":"cc-number"}}
       />
      </FormControl>
      <FormControl style={{marginRight:5}}>
       <InputLabel htmlFor='frmCCExp'>Expiration</InputLabel>
       <Input required={true} name="cc-exp" id='frmCCExp' inputProps={{"autoComplete":"cc-exp", "placeholder":"MM-YYYY"}} error={typeof this.state.errors['expiration'] === 'string'} type='text' margin='dense'  />
      </FormControl>
      <FormControl style={{marginRight:5}}>
       <InputLabel htmlFor='frmCCCVC' title="Security Code from the back of your card">CCV</InputLabel>
       <Input id='frmCCCVC' name='cvc' error={typeof this.state.errors['security_code'] === 'string'}  required={true} inputProps={{"autoComplete":"cc-csc", maxLength:3, minLength:3, min:1, max:999}} style={{width:60}} type='text' margin='dense'  />
      </FormControl>
      <FormControlLabel
       margin='dense'
       control={<Checkbox margin='dense' checked={this.state.storeToken} fontSize="small"
        onChange={e => this.setState({storeToken:!this.state.storeToken})}
       />}
       label={<small>Save encrypted token for later use</small>}
      />
     </form>
    </div>
    <div className={classes.formBlock} style={(this.state.paymethod === 0 && this.state.amountDeposit !== false) ? {display:'block'} : {display:'none'}}>
     <Typography variant='h2' className={classes.sectionHead}>Billing Address</Typography>
     <form name="billingAddressForm">
      <FormControl style={{marginRight:10}}>
       <InputLabel htmlFor='frmAddressB'>Address</InputLabel>
       <Input required={true} id='frmAddressB' name='bill-address' type='text' margin='dense' error={typeof this.state.errors['bill-address'] === 'string'} />
      </FormControl>
      <FormControl style={{marginRight:10}}>
       <InputLabel htmlFor='frmCityB'>City</InputLabel>
       <Input required={true} id='frmCityB' name='bill-city' type='text' margin='dense' error={typeof this.state.errors['bill-city'] === 'string'} />
      </FormControl>
      <FormControl style={{marginRight:10}}>
       <InputLabel htmlFor='frmStateB'>State</InputLabel>
       <Input required={true} id='frmStateB' name='bill-state' type='text' margin='dense' error={typeof this.state.errors['bill-state'] === 'string'} />
      </FormControl>
      <FormControl style={{marginRight:10}}>
       <InputLabel htmlFor='frmZipB'>Postal Code</InputLabel>
       <Input required={true} inputProps={{maxLength:10}} id='frmZipB' name='bill-zip' type='text' margin='dense' error={typeof this.state.errors['bill-zip'] === 'string'} />
      </FormControl>
      <FormControl>
       <InputLabel htmlFor='frmCountryB'>Country</InputLabel>
       <Input inputProps={{maxLength:2, minLength:2}} style={{width:60}} id='frmCountryB' name='bill-country' type='text' margin='dense' error={typeof this.state.errors['bill-country'] === 'string'} />
      </FormControl>
     </form>
    </div>

    <Grid container justify='space-around' >
     <Button variant="contained" margin="normal" color="primary"
      disabled={this.state.amountDeposit === false}
      onClick={(e) => { this.handleSubmit('deposit');}} >Deposit</Button>

     {
      this.props.wallet.balance.usd > 0 ?
       <Button variant="contained" margin="normal" color="secondary"
        disabled={this.state.amountWithdraw === false}
        onClick={(e) => this.handleSubmit('withdraw') } >Withdraw</Button> : null
     }
    </Grid>

   </div>

  );
 }
}

const styles = theme => ({
 container : {

  padding:'2% 3%',
  '& h3' : {
   margin:0,
  },
  '& h6' : {
   margin:0,
  },
  '& sup' : {
   fontSize:'75%'
  }
 },
 tacVal : {
  fontWeight: 800,
  color:theme.palette.primary.main,
 },
 usdVal : {
  fontWeight: 800,
  color:theme.palette.secondary.main,
  margin:0,
  fontSize:'16px',
  textAlign:'right'
 },
 placeholder : {
  color:'grey'
 },
 formBlock : {
  backgroundColor:theme.palette.background.paper,
  padding:5,
  marginBottom:15,
  borderRadius:5,
  display:'flex',
  flexDirection:'column'
 },
 prompt : {
  fontSize:'150%',
  color: theme.palette.primary.main,
  textShadow: '1px 1px .1px ' + theme.palette.action.active
 },
 sectionHead : {
  marginTop:0,
  marginLeft:0,
  marginBottom:4,
  opacity:0.4,
  textTransform:'uppercase',
  fontSize:15
 }
});

export default withStyles(styles)(CreditCard);
