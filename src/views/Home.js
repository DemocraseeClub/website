import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import {NavLink} from "react-router-dom";


class Home extends React.Component {

    render() {
        //const {classes} = this.props;
        //console.log(this.props);
        return (
            <Grid container direction={'column'}>

                <div style={{backgroundImage:"url('/images/cityscape.png')", backgroundPosition:'bottom right', backgroundRepeat:'no-repeat', minHeight:400}}>
                    <Grid item xs={12} sm={8} md={6} style={{padding:30}}>
                       <h1>Improve your Neighborhood</h1>
                       <p style={{margin:'40px 0', fontSize:22}}>We empower citizens to create changes in local governments through meaningful conversations and practices</p>
                       <Button style={{backgroundColor:this.props.theme.palette.error.main, color:this.props.theme.palette.error.contrastText}}
                               variant={'contained'} disableElevation={true}>Get Started</Button>
                    </Grid>
                </div>

                <Grid container justify={'space-around'} alignContent={'center'} spacing={8} style={{padding:'30px 15px'}}>

                    <Grid item xs={12} sm={4}>
                        <img src='https://democrasee.club/wp-content/uploads/2020/08/researchicon.png' alt='research' width={45} />
                        <h2 style={{color:this.props.theme.palette.error.main}}>Research & Report</h2>
                        <p>Select your values, define what they mean to you, and post the research that guides your position.</p>
                        <NavLink to={'/values'}>Select your values</NavLink>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <img src='https://democrasee.club/wp-content/uploads/2020/08/connecticon.png' alt='organize' width={45} />
                        <h2 style={{color:this.props.theme.palette.info.dark}}>Rally & Refine</h2>
                        <p>Rally your friends and foes for the change you want to see. Use our Meeting tools to guide conversations towards a productive purpose.</p>
                        <NavLink to={'/rallies'}>Rally for a Cause</NavLink>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <img src='https://democrasee.club/wp-content/uploads/2020/08/votingicon.png' alt='act' width={45} />
                        <h2 style={{color:this.props.theme.palette.primary.dark}}>Engage and Exchange</h2>
                        <p>Spend your CitizenCoin in our support marketplace to employ skills and resources from your community, to help you create the change you want to the see.</p>
                        <NavLink color={'primary'} to={'/resources'}>Find Support Resources</NavLink>
                    </Grid>
                </Grid>
            </Grid>

        );
    }

}


const useStyles = theme => ({
    root: {
        margin:20,
        padding:20
    }
});

export default withStyles(useStyles, {withTheme:true})(Home);
