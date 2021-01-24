import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import {NavLink} from "react-router-dom";

class Rallies extends React.Component {

    render() {
        const {classes} = this.props;
        return (
            <Box m={4} >
                <Box mb={4} >
                    <p>Upcoming Rallies</p>
                    <p>coming soon...</p>
                </Box>
                <Box mt={4} >
                    <NavLink to={'/rally/templates'}>Rally Templates</NavLink>
                </Box>
            </Box>
        );
    }

}


const useStyles = theme => ({
    root: {
        width: '100%',
    }
});

export default withStyles(useStyles, {withTheme:true})(Rallies);
