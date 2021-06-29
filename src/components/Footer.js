import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import {NavLink} from "react-router-dom";

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import {setThemeMode} from "../redux/authActions";
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import {rallyStyles} from "../Util/ThemeUtils";
import {withCmsHooks} from "../views/firebaseCMS/FirebaseCMS";

import userContext from '../contexts/userContext';

class Footer extends React.Component {

    static contextType = userContext

    constructor(p) {
        super(p);
        this.state = { dialog : false }
        this.toggleDialog = this.toggleDialog.bind(this);
        this.changeTheme = this.changeTheme.bind(this);

    }

    changeTheme(event) {
        this.props.dispatch(setThemeMode(event.target.checked === true ? 'dark' : 'light'));
    };

    componentDidMount() {
        // this.user = this.context

        // console.log(user, "user footer")
    }

    componentDidUpdate() {

        // this.user = this.context

        console.log(this.context, "user footer update")

    }

    toggleDialog() {
        this.setState({dialog:!this.state.dialog});
    }

    render() {
        const {classes} = this.props;
        return (
            <footer className={classes.paperRoot} id={"brandFooter"}>
                <Grid container justify={'space-around'} style={{padding:'20px 5px 10px 5px'}}>
                    <Grid item container xs={12} sm={12} direction={'column'}>
                        <Grid className="footerpadding" item container alignContent={'center'} justify={'center'} spacing={1} >
                            <Grid item>
                                <NavLink to={'/'}>
                                    <img src='/images/democrasee_logo_white.png' alt={'logo'} height={40} />
                                </NavLink>
                            </Grid>
                            <Grid item style={{flexGrow:1}}>
                                <NavLink to={'/'}><img src="/images/democrasee_text_white.png" alt={'democrasee'} height={20} /></NavLink>
                                <div className={classes.slogan}><NavLink to={'/'} className="slogan">Incentivizing Civic Action</NavLink></div>
                            </Grid>
                            <Grid item>
                                <Button size={'small'} disableElevation={true}  variant={'contained'} color={'secondary'}  onClick={e => this.setState({dialog:true})}>Newsletter</Button>
                            </Grid>
                            <Grid item>
                                <NavLink to={'/sponsors'} style={{textDecoration:'none'}}>
                                    <Button size={'small'} disableElevation={true} variant={'contained'} color={'secondary'} >Sponsor</Button>
                                </NavLink>
                            </Grid>
                            <Grid item>
                             { this.context.user != null ?
                                <NavLink to={'/citizen/'+this.context.user.uid + '/edit'} style={{textDecoration:'none'}}>
                                    <Button size={'small'} disableElevation={true} variant={'contained'} color={'secondary'} >My Account</Button>
                                </NavLink>
                                 :
                                <NavLink to={'/signin'} style={{textDecoration:'none'}}>
                                    <Button size={'small'} disableElevation={true} variant={'contained'} color={'secondary'} >Sign In</Button>
                                </NavLink>
                               }
                            </Grid>
                            <Grid item >
                            <NavLink to={'/about'} style={{textDecoration:'none'}}>
                                <Button size={'small'} disableElevation={true} variant={'contained'} color={'secondary'} >Team</Button>
                            </NavLink>
                            </Grid>
                            <Grid item>
                            <NavLink to={'/ethics'} style={{textDecoration:'none'}}>
                                <Button size={'small'} disableElevation={true} variant={'contained'} color={'secondary'} >Ethics</Button>
                            </NavLink>
                            </Grid>
                        </Grid>
                        <FormControlLabel
                                    fontSize={'small'}
                                    control={
                                        <Switch
                                            size={'small'}
                                            checked={this.props.theme.palette.type === 'dark'}
                                            onChange={this.changeTheme}
                                            color="primary"
                                            inputProps={{'aria-label': 'Dark mode'}}
                                        />
                                    }
                                    labelPlacement={"end"}
                                    label="Dark Mode"
                                />

                        <Dialog onClose={this.toggleDialog} aria-labelledby="customized-dialog-title" open={this.state.dialog}>
                            <DialogTitle id="customized-dialog-title" onClose={this.toggleDialog}>
                                Subscribe
                            </DialogTitle>
                            <DialogContent dividers>
                                Please sign up at <a href={'https://democrasee.club'} rel="noopener noreferrer" target={"_blank"}>Democrasee.club</a>
                            </DialogContent>
                        </Dialog>

                    </Grid>
                </Grid>
                <div style={{padding: 5}} className={classes.redBg}></div>

                <div style={{padding: '10px 55px', textAlign: 'right', color:this.props.theme.palette.secondary.contrastText, backgroundColor: this.props.theme.palette.secondary.light}}>
                <NavLink to={'/cms'} style={{float: 'left'}}>FireCMS</NavLink>
                    (ɔ) 2021 - Available <a style={{textDecoration:'underline'}} href={"https://github.com/DemocraseeClub/website"} target={"_blank"}>Open Source</a> via <a href={"https://www.gnu.org/licenses/gpl-3.0.html"} target={"_blank"}>GNU</a>
                </div>
            </footer>
        );
    }
}

export default withStyles(rallyStyles, {withTheme: true})(withCmsHooks(Footer));
