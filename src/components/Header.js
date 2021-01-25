import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import {NavLink} from "react-router-dom";
import Grid from '@material-ui/core/Grid';
import CitySelector from "./CitySelector";

class Header extends React.Component {

    onCity(e) {

    }

    render() {
        const {classes} = this.props;
        return (
            <AppBar position="static">
                <Toolbar className={classes.root} id={'mainHeader'}>
                    <NavLink to={'/'}>
                    <img src='/democrasee_logo_white.png' alt={'logo'} height={50} style={{marginRight: 5}}/>
                    </NavLink>
                    <div style={{textAlign: 'left'}}>
                        <div className={classes.title}>Democrasee</div>
                        <div className={classes.slogan}>Incentivizing Civic Action</div>
                    </div>

                    <div className={classes.redStripe}></div>
                    <Grid container style={{flexGrow: 1}} justify={'space-around'} alignContent={'center'}>
                        <NavLink to={'/values'}>Values</NavLink>
                        <NavLink to={'/rallies'}>Rallies</NavLink>
                        <NavLink to={'/resources'}>Resources</NavLink>
                        <Grid item>
                            <CitySelector />
                        </Grid>
                    </Grid>
                </Toolbar>
            </AppBar>
        );
    }

}


export const DemoStyles = theme => ({
    root: {
        alignContent: 'center',
        '& a': {
            color:'#002866',
            textDecorationLine: 'none',
            alignSelf: 'center'
        }
    },
    title: {
        fontWeight: 900,
        fontSize: 22,
        color: '#fff'
    },
    slogan: {
        fontWeight: 600,
        fontSize: 11,
        color: '#fff'
    },
    redStripe : {
        backgroundColor:theme.palette.error.main,
        width:20,
        height:'100%'
    }
});

export default withStyles(DemoStyles, {withTheme: true})(Header);
