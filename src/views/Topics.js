import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
// import Axios from "axios";

class Topics extends React.Component {

    componentDidMount() {
        // '/?rest_route=/wp/v2/demo_topics';
    }

    render() {
        const {classes} = this.props;
        return (
            <Paper className={classes.root}>
                <p>Topics</p>
                <p>coming soon...</p>
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
