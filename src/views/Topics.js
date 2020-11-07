import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';


class Topics extends React.Component {

    render() {
        const {classes} = this.props;
        return (
            <Paper className={classes.root}>
                <p>Topics</p>
            </Paper>
        );
    }

}


const useStyles = theme => ({
    root: {
        width: '100%',
    }
});

export default withStyles(useStyles, {withTheme:true})(Topics);
