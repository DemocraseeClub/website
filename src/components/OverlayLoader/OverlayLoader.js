import React, {Component} from 'react';
import {withStyles} from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

class OverlayLoader extends Component {
 render() {
  return (
			       <div className={this.props.classes.overlay}>
    <CircularProgress color='secondary' className={this.props.classes.preloader} />
   </div>
  );
 }
}

const styles = theme => ({
 overlay: {
  width:'100%',
  height:'100vh',
  left:0,
  top:0,
  textAlign:'center',
  backgroundColor:'rgba(0,0,0,0.5)',
  position:'fixed',
  padding:0,
  margin:0,
  zIndex:9999999,
 },
 preloader : {
  position:'absolute',
  top: '10%',
  left: '50%',
  transform:'translate(-50%, -10%)',
 }
});


export default withStyles(styles)(OverlayLoader);
