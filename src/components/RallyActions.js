import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

class RallyActions extends React.Component {

    render() {
        const {classes} = this.props;
        return (
            <div className={classes.root}>
                <Button>Join this rally</Button>
                <Button>Apply to speak</Button>
            </div>
        );
    }

}


const useStyles = theme => ({
    root: {
        width: '100%',
    },
    button: {
        marginTop: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
    actionsContainer: {
        textAlign:'left',
        marginTop: theme.spacing(2),
    },
    resetContainer: {
        padding: theme.spacing(3),
    },
    stepLabel : {
        textAlign:'left'
    },
    stepContent : {
        textAlign:'left',
    },
    topLevelLabel : {
        backgroundColor:theme.palette.primary.main,
        color:theme.palette.primary.contrastText,
        textAlign:'right',
        padding:8,
        borderRadius:'5px 5px 0 5px'
    }
});

export default withStyles(useStyles, {withTheme:true})(RallyActions);
