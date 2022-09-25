import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {listData} from '../../redux/listDataReducer';
import {listEmails} from '../../redux/emailReducer';
import {withStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import NavigateNext from '@material-ui/icons/NavigateNext';
import AddCircle from '@material-ui/icons/AddCircle';
import API from "../../Util/API";

const styles = theme => ({
 root: {
  display: 'flex',
  alignItems:'center',
  alignContent:'center',
  justifyContent: 'space-between',
  margin:'5px auto 5px auto',
  padding:'0 5px',
  fontSize:14,
  width:'100%',
  flexGrow:1,
  color: theme.palette.grey[500],
 },
 title: {
  borderLeft: '0.1em solid ' + theme.palette.grey[400],
  paddingLeft:theme.spacing(1),
  width:'100%',
  overflow:'hidden',
  textOverflow:'ellipsis'

 },
 pagiPart : {
  marginLeft:theme.spacing(3),
 },
 selector : {
  color: theme.palette.grey[500],
  fontSize:14
 }
});

class PaginatonBlock extends Component {

 constructor(props) {
  super(props);
  this.state = {perpage : this.props.meta.perpage};
 }

 changePagi(param, value) {
  let newMeta = {...this.props.meta};
  newMeta[param] = value;
  if (param === 'start_index') {
   newMeta['end_index'] = value + newMeta['perpage'];
  } else if (param === 'perpage') {
   if (newMeta['start_index'] + newMeta['perpage'] > newMeta['total_items']) {
    newMeta['start_index'] = Math.max(0, newMeta['total_items'] - newMeta['perpage']);
   }
   // newMeta['start_index'] = newMeta['end_index'];
   newMeta['end_index'] = newMeta['start_index'] + newMeta['perpage'];
  }

  if (newMeta['start_index'] > newMeta['total_items']) newMeta['start_index'] = newMeta['total_items'] - 1;
  if (newMeta['end_index'] > newMeta['total_items']) newMeta['end_index'] = newMeta['total_items'];

  //this.props.onChange(newMeta);
  // console.log(newMeta);
  let url = newMeta.url + '?start_index=' + newMeta.start_index + '&perpage=' + newMeta.perpage;
  if (newMeta.cat) {
   url += '&cat=' + newMeta.cat;
  }
  if (newMeta.seed) {
   url += '&seed=' + newMeta.seed;
  }

  if (newMeta.type === 'emails') {
   this.props.dispatch(listEmails(url));
  } else {
   this.props.dispatch(listData(url));
  }
 }

 handlePerPageChange(event) {
  this.setState({'perpage':event.target.value});
  this.changePagi('perpage', event.target.value);
 }

 render() {

  if (this.props.meta.total_items === 0) {
   return <Grid container justify='space-around' className={this.props.classes.root}>
    <Link to={'/forms' + this.props.meta.url + '/add'}>
     <IconButton aria-label={"Create " + this.props.meta.page_title } ><AddCircle /></IconButton>
    </Link>
   </Grid>;
  }

  // TODO: if not group owner / editor

  const that = this;
  return (<Grid container justify='space-between' alignItems='center' wrap='nowrap' >
    <Grid item>
     <Link to={'/forms' + this.props.meta.url + '/add'}>
      <IconButton aria-label={"Create " + this.props.meta.page_title } ><AddCircle /></IconButton>
     </Link>
     <span className={this.props.classes.title}>{this.props.meta.page_title}</span>
    </Grid>

   {
    (this.props.meta.end_index - this.props.meta.start_index >= this.props.meta.total_items) ?
     <Grid item >
      {(this.props.meta.start_index + 1) + '-' + (this.props.meta.end_index >  this.props.meta.total_items ? this.props.meta.total_items :  this.props.meta.end_index)} / {this.props.meta.total_items}
     </Grid>
     :
     <Grid item style={{margin:'auto'}}>
      <Select
       variant='standard'
       autoWidth={true}
       value={this.state.perpage}
       className={this.props.classes.selector}
       onChange={(e) => this.handlePerPageChange(e)}
      >
       {[3, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(perpage => (
        (perpage < that.props.meta.total_items + 10 || that.state.perpage === perpage) ?
         <MenuItem key={'perpage-' + perpage} value={perpage}>
          {(this.props.meta.start_index + 1) + '-' + (this.props.meta.end_index >  this.props.meta.total_items ? this.props.meta.total_items :  this.props.meta.end_index)} / {this.props.meta.total_items}
         </MenuItem> : null
       ))}
      </Select>

      <IconButton aria-label="Next page"
       onClick={(e)=>this.changePagi('start_index', this.props.meta.start_index + this.props.meta.perpage)} >
       <NavigateNext />
      </IconButton>
     </Grid>
   }
  </Grid>
  );
 }
}

export default withStyles(styles, {withTheme:true})(PaginatonBlock);
