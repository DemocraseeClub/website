import React, {Component} from 'react';
import {listEmails} from '../../redux/emailReducer';
import {withRouter} from 'react-router';
import {getParam} from '../../Util/WindowUtils';
import InviteForm from '../../components/InviteForm';
import EmailsTable from '../../components/EmailsTable';
import Drupal2Json from '../../Util/Drupal2Json';

import ProgressLoading from '../../components/ProgressLoading';
import Grid from '@material-ui/core/Grid';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import PersonAdd from '@material-ui/icons/PersonAdd';
import EmailIcon from '@material-ui/icons/Email';
import ListIcon from '@material-ui/icons/ViewList';
import Typography from "@material-ui/core/Typography";

class EmailsView extends Component {
 constructor(props) {
  super(props);

  var tab = getParam('tab', this.props.location.search, 'emails');
  if ('emails' && tab !== 'invite') tab = 'emails';
  this.state = {layout: tab};


 }

 componentDidMount() {
  this.refresh();
 }

 componentDidUpdate(prevProps) {
  if (this.props.location.pathname !== prevProps.location.pathname) {
   this.refresh();
  } else if (!prevProps.emails.apiData || !this.props.emails.apiData) {
   // first page
  } else if (prevProps.emails.apiData.metadata.request_time !== this.props.emails.apiData.metadata.request_time) {
   var elIndex = Math.max(this.props.emails.apiData.metadata.end_index - this.props.emails.apiData.metadata.perpage, 0);
   if (elIndex === 0) {
    // do nothing
   } else if (elIndex > 0) {
    var el = document.querySelector('.pBlock:nth-child('+elIndex+')');
    if (el) {
     el.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'center'});
    }
   } else {
    console.log("WHAT HAPPENED?", prevProps, this.props);
   }
  }
 }

 refresh () {
  return this.props.dispatch(listEmails(this.props.location.pathname));
 }

 render() {
  if (this.props.emails.apiData === false || this.props.emails.loading === true) return <ProgressLoading key='EmailsView-loading ' />;
  if (this.props.emails.error) return <div key='EmailsView-error' style={{width:'100%', textAlign:'center', margin:'20px auto'}}><Typography variant='h2'>{this.props.emails.error}</Typography></div>;

  var gid = this.props.location.pathname.split('/')[2];
  if (typeof this.props.me.groups[gid] === 'undefined') return 'only group owners or admins can review emails';
  var gjson =  new Drupal2Json(this.props.me.groups[gid]);
  const isGroupAdmin = gjson.isGroupAdmin(this.props.me);
  if (isGroupAdmin === false) return 'only group owners or admins can review emails';

  var list = [];
  if (this.state.layout === 'invite' || this.props.emails.apiData.data.length === 0) {
   list = <InviteForm me={this.props.me} isLoading={this.props.emails.loading} gjson={gjson} dispatch={this.props.dispatch} />;
  } else {
   list = <EmailsTable apiData={this.props.emails.apiData} me={this.props.me} dispatch={this.props.dispatch} />;
  }

  return (
   <div style={{width:'100%', position:'relative'}} key={this.props.emails.apiData.metadata.request_time}>

    {(this.props.emails.error === true) ? <Grid item xs={12}><Typography variant='h2'>{this.props.emails.error}</Typography></Grid> : null}

    <Tabs
     value={this.state.layout === 'invite' ? 0 : 1}
     variant="fullWidth"
     indicatorColor="secondary"
     textColor="secondary" style={{marginBottom:10}} >
     <Tab icon={<EmailIcon />} label="Invite" onClick={(e) => this.setState({layout:'invite'})} />
     <Tab icon={<PersonAdd />} label="Pending" onClick={(e) => this.setState({layout:'emails'})} />
     <Tab icon={<ListIcon />} label="Members" onClick={(e) => this.props.history.push('/group/'+gid+'/members')} />
    </Tabs>

    <Grid
     container
     direction='row'
     justify="center"
     alignContent="space-between"
     alignItems="center"
     spacing={0}
    >
     {list}
    </Grid>
   </div>
  );
 }
}

export default withRouter(EmailsView);
