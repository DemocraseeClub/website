import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import {NavLink} from "react-router-dom";

class Rallies extends React.Component {

    render() {
        return (
            <Box m={4} >
                <Box mb={4} >
                    <Typography variant={'subtitle1'}>Rallying</Typography>
                    <p><NavLink to={'/rally/building-democrasee'}>Building Democrasee</NavLink></p>
                    <p><NavLink to={'/rally/hgp'}>Hidden Genius Project</NavLink></p>
                    <p><NavLink to={'/rally/fighting-defamation'}>Fighting Defamation</NavLink></p>
                </Box>
                <Box mt={10} >
                    <NavLink to={'/rally/templates'}>Create a Rally</NavLink>
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
