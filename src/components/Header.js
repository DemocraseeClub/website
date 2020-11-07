import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import {NavLink} from "react-router-dom";
import Grid from '@material-ui/core/Grid';
import InputBase from '@material-ui/core/InputBase';
import {fade} from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';

class Header extends React.Component {

    onCity(e) {

    }

    render() {
        const {classes} = this.props;
        return (
            <AppBar position="static">
                <Toolbar className={classes.root} id={'mainHeader'}>
                    <img src='/democrasee-logo-white.png' alt={'logo'} height={50} style={{marginRight: 5}}/>
                    <div style={{textAlign: 'left'}}>
                        <div className={classes.title}>Democrasee</div>
                        <div className={classes.slogan}>Incentivizing Civic Action</div>
                    </div>
                    <div className={classes.redStripe}></div>
                    <Grid container style={{flexGrow: 1}} justify={'space-around'} alignContent={'center'}>
                        <NavLink to={'/values'}>Values</NavLink>
                        <NavLink to={'/rallies'}>Rallies</NavLink>
                        <NavLink to={'/cities'}>Cities</NavLink>
                        <Grid item>
                            <div className={classes.search}>
                                <div className={classes.searchIcon}>
                                    <SearchIcon color={'secondary'}/>
                                </div>
                                <InputBase
                                    placeholder="Oakland"
                                    classes={{
                                        root: classes.inputRoot,
                                        input: classes.inputInput,
                                    }}
                                    inputProps={{'aria-label': 'search'}}
                                />
                            </div>

                        </Grid>

                    </Grid>
                </Toolbar>
            </AppBar>
        );
    }

}


const useStyles = theme => ({
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
    },
    search: {
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: fade(theme.palette.common.white, 0.25),
        },
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing(1),
            width: 'auto',
        },
    },
    searchIcon: {
        padding: theme.spacing(0, 2),
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputRoot: {
        color: '#002866',
    },
    inputInput: {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: '12ch',
            '&:focus': {
                width: '20ch',
            },
        }
    }
});

export default withStyles(useStyles, {withTheme: true})(Header);
