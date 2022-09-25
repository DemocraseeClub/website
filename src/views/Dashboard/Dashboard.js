import React, {Component} from 'react';
import Grid from '@material-ui/core/Grid';
import {withRouter} from 'react-router';
import PaginationBlock from '../../components/PaginationBlock';
import OverlayLoader from '../../components/OverlayLoader';
import ItemGrid from '../../components/ItemGrid';
import ProgressLoading from '../../components/ProgressLoading';
import {Link} from 'react-router-dom';
import IconButton from '@material-ui/core/IconButton';
import AddCircle from '@material-ui/icons/AddCircle';
import Typography from "@material-ui/core/Typography";


class Dashboard extends Component {

 componentDidMount() {
  this.refresh();
 }

 componentDidUpdate(prevProps) {
  if (this.props.location.pathname + this.props.location.search !== prevProps.location.pathname + prevProps.location.search) {
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
  return this.props.refreshList(this.props.location.pathname + this.props.location.search);
 }

 render() {
  if (this.props.lists.error) return <div style={{width:'100%', textAlign:'center', margin:'20px auto'}}><Typography variant='h2'>{this.props.lists.error}</Typography></div>;
  if (!this.props.lists.apiData) return <ProgressLoading />;
  if (this.props.lists.apiData.metadata.url.indexOf(this.props.location.pathname) !== 0) return <ProgressLoading />;
  if (this.props.lists.apiData.data.length === 0) {
   return <PaginationBlock meta={this.props.lists.apiData.metadata} dispatch={this.props.dispatch} />;
  }

  return (<div style={{position:'relative', width:'100%'}}>
    {(this.props.lists.error) ? <Grid item xs={12}><Typography variant='h2'>{this.props.lists.error}</Typography></Grid> : null}

    <ItemGrid lData={this.props.lists.apiData} me={this.props.me} dispatch={this.props.dispatch} />

    {this.props.lists.apiData.metadata.total_items > this.props.lists.apiData.data.length
     ?
     <PaginationBlock meta={this.props.lists.apiData.metadata} dispatch={this.props.dispatch} />
     :
     <footer style={{marginTop:50}}>
      <Link to={'/forms' + this.props.lists.apiData.metadata.url + '/add'}>
       <IconButton aria-label={"Create " + this.props.lists.apiData.metadata.page_title } ><AddCircle /></IconButton>
      </Link>
      {'Create ' + this.props.lists.apiData.metadata.page_title}
     </footer>
    }

    {(this.props.lists.loading === true) ?  <OverlayLoader /> : null}

   </div>
  );
 }
}

export default withRouter(Dashboard);
