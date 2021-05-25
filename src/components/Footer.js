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

class Footer extends React.Component {

    constructor(p) {
        super(p);
        this.state = { dialog : false }
        this.toggleDialog = this.toggleDialog.bind(this);
        this.changeTheme = this.changeTheme.bind(this);
    }

    changeTheme(event) {
        this.props.dispatch(setThemeMode(event.target.checked === true ? 'dark' : 'light'));
    };

    toggleDialog() {
        this.setState({dialog:!this.state.dialog});
    }

    render() {
        const {classes} = this.props;
        return (
            <footer className={classes.paperRoot}>
                <Grid container justify={'space-around'} style={{padding:'20px 5px 10px 5px'}}>
                    <Grid item container xs={12} sm={3} direction={'column'}>
                        <Grid item container alignContent={'center'} justify={'center'} style={{marginBottom:20}} spacing={1}>
                            <Grid item>
                                <NavLink to={'/'}>
                                    <img src='/images/democrasee_logo_white.png' alt={'logo'} height={40} />
                                </NavLink>
                            </Grid>
                            <Grid item>
                                <img src="/images/democrasee_text_white.png" alt={'democrasee'} height={20} />
                                <div className={classes.slogan}>Incentivizing Civic Action</div>
                            </Grid>
                        </Grid>

                        <Grid item container alignContent={'center'} spacing={4} >
                            <Grid item xs={6}>
                                <Button disableElevation={true}  variant={'contained'} className={classes.redBtn} fullWidth={true} onClick={e => this.setState({dialog:true})}>Subscribe</Button>
                            </Grid>
                            <Grid item xs={6}>
                            <NavLink to={'/sponsors'} style={{textDecoration:'none', marginTop:20}}>
                                <Button disableElevation={true} variant={'contained'} color={'secondary'} fullWidth={true}>Sponsor</Button>
                            </NavLink>
                            </Grid>
                        </Grid>

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
                        <ul className={classes.menuList}>
                            {this.props.authController && this.props.authController.loggedUser ?
                                <li><NavLink to={'/user/'+this.props.authController.loggedUser.uid}>My Account</NavLink></li>
                                :
                                <li><NavLink to={'/login'}>Sign In / Up</NavLink></li>
                            }
                            <li><NavLink to={'/rallies'}>Rallies</NavLink></li>
                            <li><NavLink to={'/resources'}>Resources</NavLink></li>

                        </ul>
                    </Grid>
                    <Grid item>
                        <ul className={classes.menuList}>
                            <li><NavLink to={'/'}>Home</NavLink></li>
                            <li><NavLink to={'/sponsors'}>Sponsors</NavLink></li>
                            <li><NavLink to={'/about'}>Team</NavLink></li>
                            <li><NavLink to={'/ethics'}>Terms of Use</NavLink></li>
                            <li><NavLink to={'/cms'}>FireCMS</NavLink></li>
                            <li>
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
                            </li>
                        </ul>
                    </Grid>
                </Grid>
                <div style={{padding: 5}} className={classes.redBg}></div>

                <div style={{padding: 10, textAlign: 'right', color:this.props.theme.palette.secondary.contrastText, backgroundColor: this.props.theme.palette.secondary.light}}>
                    (ɔ) 2021 - Available <a style={{textDecoration:'underline'}} href={"https://github.com/DemocraseeClub/website"} target={"_blank"}>Open Source</a> via <a href={"https://www.gnu.org/licenses/gpl-3.0.html"} target={"_blank"}>GNU</a>
                </div>
            </footer>
        );
    }
}

export default withStyles(rallyStyles, {withTheme: true})(withCmsHooks(Footer));
