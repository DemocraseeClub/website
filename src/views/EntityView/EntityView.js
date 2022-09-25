import React, {Component} from 'react';
import {withRouter} from 'react-router';
import Drupal2Json from '../../Util/Drupal2Json';
import RallyHome from "../RallyHome";
import ProgressLoading from '../../components/ProgressLoading';
import Typography from "@material-ui/core/Typography";

class EntityView extends Component {

 componentDidMount() {
  this.refresh();
 }

 componentDidUpdate(prevProps) {
  if (this.props.location.pathname !== prevProps.location.pathname || this.props.location.search !== prevProps.location.search) {
   this.refresh();
  }
 }

 refresh () {
  var url = (this.props.me.profile && this.props.location.pathname === '/my-profile') ?
   '/users/' + this.props.me.profile.uid[0].value
   :
   this.props.location.pathname;

  if (url.indexOf('group/') > -1) {
   let segs = this.props.location.pathname.split('/');
   if (segs.length === 3) { // ex. /group/#
    url += '/details'; // api thinks /group/# is the Group module
   }
  }

  return this.props.refreshEntity(url);
 }

 render() {
  if (this.props.entity.loading === true) return <ProgressLoading />;
  if (this.props.entity.error) return <div style={{width:'100%', textAlign:'center', margin:'20px auto'}}><Typography variant='h2'>{this.props.entity.error}</Typography></div>;
  if (this.props.entity.url.indexOf(this.props.location.pathname) !== 0 && this.props.location.pathname !== '/my-profile') return <ProgressLoading />;
  if (!this.props.entity.apiData) return 'no results';

  var item = this.props.entity.apiData;
  var json = new Drupal2Json(item);
  var type = json.get('type', 'target_id');
  var canEdit = json.canEdit(this.props.me.profile);
  var view = '';

  if (type === "rallies") {
   view = <RallyHome  me={this.props.me} dispatch={this.props.dispatch} data={item} lists={this.props.lists} />;
  }

  return view;
 }
}

export default withRouter(EntityView);
