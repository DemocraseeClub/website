import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import {NavLink} from "react-router-dom";

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import Typography from '@material-ui/core/Typography';
import Card from "@material-ui/core/Card";

import {rallyStyles} from "../Util/ThemeUtils";

class Home extends React.Component {

    constructor(p) {
        super(p);
        this.state = { dialog : false, coinDef:false }
        this.toggleCoinDef =this.toggleCoinDef.bind(this);
    }

    toggleCoinDef(e) {
        e.preventDefault();
        this.setState({coinDef:!this.state.coinDef});
    }

    render() {
        const {classes} = this.props;
        return (
            <Grid container direction={'column'} className={this.props.classes.section}>

                <Grid style={{backgroundImage:"url('/images/cityscape.png')", backgroundPosition:'bottom right', backgroundRepeat:'no-repeat', minHeight:400, marginBottom:30}}
                     container justify={'space-around'} direction={'column'} alignItems={'flex-start'} >
                    <Grid item xs={12} >
                       <Card style={{borderRadius:8, padding:'10px', margin:'10px 30px', background: 'none', boxShadow: 'none'}} >
                           <Typography variant={'h1'} style={{marginBottom: 0}}><b>Conversations for a better community</b></Typography>
                           <Typography variant={'h3'} style={{marginTop:0, fontSize:22}}>Tools and resources to turn ideas and intentions into action</Typography>
                       </Card>
                    </Grid>
                    <Grid item style={{padding:30}} >
                        <NavLink style={{textDecoration: 'none'}} to={'/rallies'}><Button style={{backgroundColor:this.props.theme.palette.error.main, color:this.props.theme.palette.error.contrastText, marginRight:10}}
                            variant={'contained'} disableElevation={true}>Join a Rally</Button></NavLink>
                        <NavLink style={{textDecoration: 'none'}} to={'/rally/templates'}><Button color={'secondary'}
                               variant={'contained'} disableElevation={true}>Start a Rally</Button></NavLink>
                    </Grid>
                </Grid>

                <Card style={{padding:5, background: 'none', boxShadow: 'none'}}>

                <Grid container justify={'space-around'} alignContent={'center'} alignItems={'center'} style={{textAlign:'center', marginBottom: '30px'}}>
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

                <Grid container justify={'space-around'} alignContent={'center'} style={{textAlign:'center',  marginBottom: '30px'}}>

                    <Grid item xs={4}>
                        <Typography variant={'h2'} className={classes.errorColor} >Research & Report</Typography>
                    </Grid>

                    <Grid item xs={4}>
                        <Typography variant={'h2'} className={classes.infoColor} >Rally & Refine</Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography variant={'h2'} className={classes.primaryColor} >Engage &amp; Exchange</Typography>
                    </Grid>
                </Grid>

                    <Grid container justify={'space-around'} alignContent={'center'} spacing={3} style={{ marginBottom: '30px'}}>

                    <Grid item xs={4}>
                        <Typography variant={'p'} className={classes.paragraph}>Select your values, define what they mean to you, and post the research that guides your position.</Typography>
                    </Grid>

                    <Grid item xs={4}>
                        <Typography variant={'p'} className={classes.paragraph}>Rally your friends and foes for the change you want to see. Use our Meeting tools to guide conversations towards a productive purpose.</Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography variant={'p'} className={classes.paragraph}>Exchange your <a href={"#coin"} className={classes.primaryColor} onClick={e => this.toggleCoinDef(e)}>CitizenCoin</a> in our marketplace to employ skills and resources from your community, for your community.</Typography>
                    </Grid>
                </Grid>

                <Grid container justify={'space-around'} alignContent={'center'} style={{textAlign:'center',  marginBottom: '30px'}}>
                    <Grid item xs={4}>
                        <NavLink className={classes.errorColor} to={'/values'}>Select your values</NavLink>
                    </Grid>

                    <Grid item xs={4}>
                        <NavLink className={classes.infoColor}  to={'/rallies'}>Rally for a Cause</NavLink>
                    </Grid>
                    <Grid item xs={4}>
                        <NavLink className={classes.primaryColor}  to={'/resources'}>Find Support Resources</NavLink>
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


                </Card>

            </Grid>

        );
    }

}

export default withStyles(rallyStyles, {withTheme:true})(Home);
