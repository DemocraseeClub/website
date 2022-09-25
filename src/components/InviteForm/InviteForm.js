import React, {Component} from 'react';
import {withStyles} from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import Button from '@material-ui/core/Button';
import {sendInvites} from '../../redux/emailReducer';
import Typography from "@material-ui/core/Typography";

class InviteForm extends Component {

 validateEmails() {

 }

 handleSubmit(evt) {
  evt.preventDefault();
  var report = evt.currentTarget.reportValidity();
  if (!report) {
   return alert('invalid form');
  }
  const emails = evt.currentTarget.emails.value.split(',');
  if (emails.length === 0) return alert('where do you want to send this?');

  if (window.confirm('Are you sure you want to send ' + ( emails.length === 1 ? '1 invite?' : emails.length + ' invites?'))) {
   this.props.dispatch(sendInvites(evt.currentTarget.gid.value, {
    emails : evt.currentTarget.emails.value,
    subject : evt.currentTarget.subject.value,
    message : evt.currentTarget.message.value,
    cta_url : evt.currentTarget.cta_url.value,
   }));
  }
  return false;
 }

 render() {
  const { gjson, classes } = this.props;

  return (
   <form onSubmit={e => this.handleSubmit(e)}  autoComplete="off" action={'forms/group/'+gjson.get('id', 'value')+'/invites'} method='POST' name='invite-form'
    className={classes.paperBg + ' taForm page'} >
    <input type='hidden' value={gjson.get('id', 'value')} name="gid" />
    <Typography variant='h2' style={{margin:'2px 0 4px 0'}}>Invite members to {gjson.get('label')}</Typography>
    <FormControl fullWidth  >
     <InputLabel htmlFor='invite-list'>Email List</InputLabel>
     <Input required={true} id='invite-list' type='textarea' name='emails' rows={2} multiline={true} />
     <FormHelperText>Enter 1 - 500 emails. Separated by commas. EX: "jcole@example.com, John Doe &lt;jdoe@example.com&gt;" </FormHelperText>
    </FormControl>
    <div style={{marginTop:40}}>
     <FormControl fullWidth >
      <InputLabel htmlFor='invite-subject'>Optional Subject</InputLabel>
      <Input id='invite-subject' type='textarea' name='subject' />
      <FormHelperText>The subject of your email. 4000 characters max.</FormHelperText>
     </FormControl>
     <FormControl fullWidth style={{marginTop:20}} >
      <InputLabel htmlFor='invite-message'>Optional Message</InputLabel>
      <Input id='invite-message' type='textarea' name='message' rows={3} multiline={true} />
      <FormHelperText>A personal message within your invitation email. 255 characters max.</FormHelperText>
     </FormControl>
     <FormControl fullWidth style={{marginTop:20}} >
      <InputLabel htmlFor='cta-url'>CTA Link</InputLabel>
      <Input id='cta-url' type='url' name='cta_url' />
      <FormHelperText>Enter the URL where you want links in this email to direct the recipient</FormHelperText>
     </FormControl>
    </div>
    <div style={{marginTop:20}}>
     <Button
      type="submit"
      variant="contained"
      margin="normal"
      disabled={this.props.isLoading === true}
      style={{marginRight:20}}
      color="primary"  >Submit</Button>
    </div>

   </form>
  );
 }
}


const styles = theme => ({
 paperBg: {
  backgroundColor: theme.palette.background.paper,
  paddingTop:10,
  paddingBottom:15,
  borderRadius:3
 }
});

export default withStyles(styles)(InviteForm);
