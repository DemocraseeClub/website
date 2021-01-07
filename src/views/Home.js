import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import {NavLink} from "react-router-dom";

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import Typography from '@material-ui/core/Typography';
import CitySelector from "../components/CitySelector";

class Home extends React.Component {

    constructor(p) {
        super(p);
        this.state = { dialog : false, coinDef:false }
        this.toggleCoinDef =this.toggleCoinDef.bind(this);
        this.toggleDialog = this.toggleDialog.bind(this);
    }

    toggleDialog() {
        this.setState({dialog:!this.state.dialog});
    }

    toggleCoinDef(e) {
        e.preventDefault();
        this.setState({coinDef:!this.state.coinDef});
    }

    render() {
        const {classes} = this.props;
        return (
            <Grid container direction={'column'} style={{marginBottom:30}}>

                <Grid style={{backgroundImage:"url('/images/cityscape.png')", backgroundPosition:'bottom right', backgroundRepeat:'no-repeat', minHeight:400, marginBottom:30}}
                     container justify={'space-around'} direction={'column'} alignItems={'flex-start'} >
                    <Grid item xs={12} >
                       <div style={{backgroundColor:'rgba(255,255,255,.65)', borderRadius:8, padding:'10px', margin:'10px 30px'}} >
                           <h1 style={{marginBottom: 0}}>Conversations for a better community</h1>
                           <p style={{marginTop:0, fontSize:22}}>Tools and resources to turn ideas and intentions into action</p>
                       </div>
                    </Grid>
                    <Grid item style={{padding:30}} >
                    <Button style={{backgroundColor:this.props.theme.palette.error.main, color:this.props.theme.palette.error.contrastText}}
                            onClick={e => this.setState({dialog:true})}
                            variant={'contained'} disableElevation={true}>Get Started</Button>
                    </Grid>
                </Grid>

                <Dialog onClose={this.toggleDialog} aria-labelledby="customized-dialog-title" open={this.state.dialog}>
                    <DialogTitle id="customized-dialog-title" onClose={this.toggleDialog}>
                        Get Started
                    </DialogTitle>
                    <DialogContent dividers>
                        <Typography gutterBottom>
                            <CitySelector />
                        </Typography>
                    </DialogContent>
                </Dialog>

                <div style={{padding:5}}>

                <Grid container justify={'space-around'} alignContent={'center'} alignItems={'center'} style={{textAlign:'center'}}>
                    <Grid item xs={4}>
                        <img src='https://democrasee.club/wp-content/uploads/2020/08/researchicon.png' alt='research' width={45} />
                    </Grid>
                    <Grid item xs={4}>
                        <img src='https://democrasee.club/wp-content/uploads/2020/08/connecticon.png' alt='organize' width={45} />
                    </Grid>
                    <Grid item xs={4}>
                        <img src='https://democrasee.club/wp-content/uploads/2020/08/votingicon.png' alt='act' width={45} />
                    </Grid>
                </Grid>

                <Grid container justify={'space-around'} alignContent={'center'} style={{textAlign:'center'}}>

                    <Grid item xs={4}>
                        <h2 className={classes.errorDark} >Research & Report</h2>
                    </Grid>

                    <Grid item xs={4}>
                        <h2 className={classes.infoDark} >Rally & Refine</h2>
                    </Grid>
                    <Grid item xs={4}>
                        <h2 className={classes.primaryDark} >Engage &amp; Exchange</h2>
                    </Grid>
                </Grid>

                <Grid container justify={'space-around'} alignContent={'center'} >

                    <Grid item xs={4}>
                        <p className={classes.paragraph}>Select your values, define what they mean to you, and post the research that guides your position.</p>
                    </Grid>

                    <Grid item xs={4}>
                        <p className={classes.paragraph}>Rally your friends and foes for the change you want to see. Use our Meeting tools to guide conversations towards a productive purpose.</p>
                    </Grid>
                    <Grid item xs={4}>
                        <p className={classes.paragraph}>Exchange your <a href={"#coin"} className={classes.primaryDark} onClick={e => this.toggleCoinDef(e)}>CitizenCoin</a> in our marketplace to employ skills and resources from your community, for your community.</p>
                    </Grid>
                </Grid>

                <Grid container justify={'space-around'} alignContent={'center'} style={{textAlign:'center'}}>
                    <Grid item xs={4}>
                        <NavLink className={classes.errorDark} to={'/values'}>Select your values</NavLink>
                    </Grid>

                    <Grid item xs={4}>
                        <NavLink className={classes.infoDark}  to={'/rallies'}>Rally for a Cause</NavLink>
                    </Grid>
                    <Grid item xs={4}>
                        <NavLink className={classes.primaryDark}  to={'/resources'}>Find Support Resources</NavLink>
                    </Grid>
                </Grid>


                <Dialog onClose={this.toggleCoinDef} aria-labelledby="customized-dialog-title" open={this.state.coinDef}>
                    <DialogTitle id="customized-dialog-title" onClose={this.toggleCoinDef}>
                        CitizenCoin
                    </DialogTitle>
                    <DialogContent dividers>
                        <Typography gutterBottom component='h3'>
                            Ways to earn CitizenCoin
                        </Typography>
                        <img src='/images/coin-payouts.png' alt={'payouts'} style={{width:'100%'}} />
                    </DialogContent>
                </Dialog>


                </div>

            </Grid>

        );
    }

}


const useStyles = theme => ({
    paragraph : {
        lineHeight:'23px',
        paddingLeft:10,
        paddingRight:10
    },
    infoDark : {
        color: theme.palette.info.dark
    },
    primaryDark : {
        color: theme.palette.primary.dark
    },
    errorDark : {
       color: theme.palette.error.dark
    }
});

export default withStyles(useStyles, {withTheme:true})(Home);
