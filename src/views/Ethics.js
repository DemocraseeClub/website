import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';


class Ethics extends React.Component {

    render() {
        // const {classes} = this.props;
        return (
            <Paper style={{margin:20, padding:20}}>
                <p>Diversity and Inclusion Policy</p>
                <p>Content Moderation Guidelines</p>
                <p>User Privacy Policy</p>
                <p>Content Ownership Policy</p>
            </Paper>
        );
    }

}


const useStyles = theme => ({
    root: {
        width: '100%',
    }
});

export default withStyles(useStyles, {withTheme:true})(Ethics);
