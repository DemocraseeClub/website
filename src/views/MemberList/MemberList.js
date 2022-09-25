import React, {Component} from 'react';
import {listData} from '../../redux/listDataReducer';
import {withRouter} from 'react-router';
import {getParam} from '../../Util/WindowUtils';
import MemberBlock from '../../components/MemberBlock';
import MembersTable from '../../components/MembersTable';
import Drupal2Json from '../../Util/Drupal2Json';

import ProgressLoading from '../../components/ProgressLoading';
import Grid from '@material-ui/core/Grid';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import GridIcon from '@material-ui/icons/ViewModule';
import ListIcon from '@material-ui/icons/ViewList';
import EmailIcon from '@material-ui/icons/Email';
import Typography from "@material-ui/core/Typography";

//import Typography from '@material-ui/core/Typography';
//import OverlayLoader from '../../components/OverlayLoader';

class MemberList extends Component {
 constructor(props) {
  super(props);

  var tab = getParam('tab', this.props.location.search, 'list');
  if (tab !== 'list' && tab !== 'grid') tab = 'list'; // TODO: test direct invite access when not group admin
  this.state = {layout: tab};


 }

 componentDidMount() {
  this.refresh();
 }

 componentDidUpdate(prevProps) {
  if (this.props.location.pathname !== prevProps.location.pathname) {
   this.refresh();
  } else if (!prevProps.lists.apiData || !this.props.lists.apiData) {
   // first page
  } else if (prevProps.lists.apiData.metadata.request_time !== this.props.lists.apiData.metadata.request_time) {
   var elIndex = Math.max(this.props.lists.apiData.metadata.end_index - this.props.lists.apiData.metadata.perpage, 0);
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
  return this.props.dispatch(listData(this.props.location.pathname));
 }

 render() {
  if (this.props.lists.loading === true) return <ProgressLoading />;
  if (this.props.lists.error) return <div style={{width:'100%', textAlign:'center', margin:'20px auto'}}><Typography variant='h2'>{this.props.lists.error}</Typography></div>;
  if (!this.props.me.groups) return 'you cannot view members or emails for this group';
  var gid = this.props.location.pathname.split('/')[2];
  if (typeof this.props.me.groups[gid] === 'undefined') return 'you must join this group to view its members';

  if (this.props.lists.apiData === false || this.props.lists.loading === true) return <ProgressLoading key='MemberList-loading ' />;
  if (this.props.lists.error) return <div key='MemberList-error' style={{width:'100%', textAlign:'center', margin:'20px auto'}}><Typography variant='h2'>{this.props.lists.error}</Typography></div>;

  var gjson = new Drupal2Json(this.props.me.groups[gid]);
  const isGroupAdmin = gjson.isGroupAdmin(this.props.me);
  console.log(this.props.me, gid, isGroupAdmin);

  var list = [];
  if (this.state.layout === 'grid') {
   for(var f in this.props.lists.apiData.data) {
    var item = this.props.lists.apiData.data[f];
    var json = new Drupal2Json(item);
    var type = json.get('type', 'target_id');
    list.push(<Grid item xs={6} sm={4} key={type+'_'+f}  ><MemberBlock data={item} me={this.props.me} canEdit={json.canEdit(this.props.me.profile)}  /></Grid>);
   }
  } else {
   list = <MembersTable apiData={this.props.lists.apiData} me={this.props.me} dispatch={this.props.dispatch} />;
  }

  return (
   <div style={{width:'100%', position:'relative'}} key={this.props.lists.apiData.metadata.request_time}>

    {(this.props.lists.error === true) ? <Grid item xs={12}><Typography variant='h2'>{this.props.lists.error}</Typography></Grid> : null}

    <Tabs
     value={this.state.layout === 'grid' ? 0 : 1}
     variant="fullWidth"
     indicatorColor="secondary"
     textColor="secondary" style={{marginBottom:10}} >
     <Tab icon={<GridIcon />} label="Grid" onClick={(e) => this.setState({layout:'grid'})} />
     <Tab icon={<ListIcon />} label="List" onClick={(e) => this.setState({layout:'list'})} />
     {isGroupAdmin === true ? <Tab icon={<EmailIcon />} label="Emails" onClick={(e) => this.props.history.push('/group/'+gid+'/emails?tab=emails')} /> : null }
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

export default withRouter(MemberList);
