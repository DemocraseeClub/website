import React, { Component } from 'react'
import {withSnackbar} from 'notistack';
import {withStyles} from '@material-ui/core/styles';

class RallyCreate extends Component {
  render() {
    return (
      <div>
      </div>
    )
  }
}

const useStyles = theme => ({

});

export default withStyles(useStyles, {withTheme: true})(withSnackbar(RallyCreate));
