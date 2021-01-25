import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import {NavLink} from "react-router-dom";

import Dialog from '@material-ui/core/Dialog';
// import Typography from '@material-ui/core/Typography';
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";

class Footer extends React.Component {

    constructor(p) {
        super(p);
        this.state = { dialog : false }
        this.toggleDialog = this.toggleDialog.bind(this);
    }

    toggleDialog() {
        this.setState({dialog:!this.state.dialog});
    }

    render() {
        const {classes} = this.props;
        return (
            <footer className={classes.root}>
                <Grid container justify={'space-around'} style={{padding: 10}}>
                    <Grid item container xs={12} sm={3} direction={'column'}>
                        <Grid item container alignContent={'center'} style={{marginBottom:20}}>
                            <Grid item>
                                <img alt={'logo'} src='/democrasee_logo_white.png' height={60} style={{marginRight: 5}}/>
                            </Grid>
                            <Grid item>
                                <div className={classes.title}>Democrasee</div>
                                <div className={classes.slogan}>Incentivizing Civic Action</div>
                            </Grid>
                        </Grid>
                        <Button variant={'contained'} color={'secondary'} onClick={e => this.setState({dialog:true})}>Subscribe</Button>

                        <Dialog onClose={this.toggleDialog} aria-labelledby="customized-dialog-title" open={this.state.dialog}>
                            <DialogTitle id="customized-dialog-title" onClose={this.toggleDialog}>
                                Subscribe
                            </DialogTitle>
                            <DialogContent dividers>
                                Please sign up at <a href={'https://democrasee.club'} rel="noopener noreferrer" target={"_blank"}>Democrasee.club</a>
                            </DialogContent>
                        </Dialog>

                    </Grid>
                    <Grid item>
                        <h4>Citizen Up!</h4>
                        <ul className={classes.menuList}>
                            <li><NavLink to={'/register'}>Register</NavLink></li>
                            <li><NavLink to={'/login'}>Login</NavLink></li>
                            <li><NavLink to={'/values'}>Values</NavLink></li>
                            <li><NavLink to={'/rallies'}>Rallies</NavLink></li>
                            <li><NavLink to={'/resources'}>Resources</NavLink></li>
                        </ul>
                    </Grid>
                    <Grid item>
                        <h4>Learn</h4>
                        <ul className={classes.menuList}>
                            <li><NavLink to={'/'}>Home</NavLink></li>
                            <li><NavLink to={'/about'}>Team</NavLink></li>
                            <li><NavLink to={'/ethics'}>Ethics</NavLink></li>
                        </ul>
                    </Grid>
                </Grid>
                <div style={{padding: 5}} className={classes.redBg}></div>
                <div style={{padding: 10, textAlign: 'right', color: '#002866'}}
                     className={classes.lightBlue}>2020 &copy; democrasee.club
                </div>
            </footer>
        );
    }
}


const useStyles = theme => ({
    root: {
        width: '100%',
        textAlign: 'left',
        backgroundColor: '#095760',
        color: '#ffffff',
        '& a': {
            color: 'inherit',
            textDecorationLine: 'none'
        }
    },
    redBg: {
        backgroundColor: '#D6524C'
    },
    lightBlue: {
        backgroundColor: '#b9dff4'
    },
    menuList: {
        listStyle: 'none',
        padding: 0, margin: 0,
        '& li': {
            marginBottom: 15
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
});

export default withStyles(useStyles, {withTheme: true})(Footer);
