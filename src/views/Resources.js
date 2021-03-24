import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import {withSnackbar} from 'notistack';
import CardActionArea from "@material-ui/core/CardActionArea";
import Grid from "@material-ui/core/Grid";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import CardActions from "@material-ui/core/CardActions";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import Box from "@material-ui/core/Box";
import Avatar from '@material-ui/core/Avatar';


class Resources extends React.Component {

    redeem(email) {
        this.props.enqueueSnackbar('Email: ' + email);
        window.logUse.logEvent('resource-redeem', {email: email});
    }

    render() {
        const {classes} = this.props;
        return (
            <Box>
                <Grid container className={classes.blueSection}>
                    <Grid item xs={8}>
                        <Typography variant={'h5'} className={classes.blueSectionTitle}><b>Request and Receive Help From Your Community</b></Typography>
                        <Typography variant={'h6'} className={classes.blueSectionSubtitle}>All action with plans will receive a percentage of the current city pot of <b>2000 Citize Coins</b></Typography>
                        <Grid container spacing={3} className={classes.blueSectionItemsContainer }>
                            <Grid item>
                                <Box display="flex" alignItems="center">
                                    <Avatar src="/images/democrasee_logo_black.png" className={classes.blueSectionItemImg} alt="citizen-coin"/>
                                    <Typography variant={'body2'} className={classes.blueSectionItemText}><b>Earn 2 - 2000 Citizen Coins</b></Typography>                                    
                                </Box>
                            </Grid>
                            <Grid item>
                                <Box display="flex" alignItems="center">
                                    <Avatar src="/images/democrasee_logo_black.png" className={classes.blueSectionItemImg} alt="hero-badge"/>
                                    <Typography variant={'body2'} className={classes.blueSectionItemText}><b>Explorer or Hero Badge</b></Typography>
                                </Box>
                            </Grid>
                            <Grid item>
                                <Box display="flex" alignItems="center">
                                    <Avatar src="/images/democrasee_logo_black.png" className={classes.blueSectionItemImg} alt="Time-knowledge"/>
                                    <Typography variant={'body2'} className={classes.blueSectionItemText}><b>Time and Knowledge</b></Typography>
                                </Box>
                            </Grid>
                        </Grid>
                        <Button variant="outlined" className={classes.blueSectionLeftButton}>Request Help</Button>
                        <Button className={classes.blueSectionRightButton}>Offer Your Expertise</Button>
                    </Grid>
                    <Grid item xs={4}>
                        <Box display="flex" alignItems="center" justifyContent="center">
                            <img src="/images/democrasee_logo_black.png" alt="blueSection-hero" className={classes.blueSectionHero}/>
                        </Box>
                    </Grid>
                </Grid>
                {/* <Box m={4}>
                    <Grid container justify={'space-around'} spacing={4}>
                        <Grid item xs={12} sm={6} md={4}>
                            <Card>
                                <CardActionArea>
                                    <CardMedia
                                        component="img"
                                        alt="TaylorMadeTraffic Logo"
                                        height="200"
                                        image="https://taylormadetraffic.com/wwwroot/images/tmm_logo_tl.jpg"
                                        title="TaylorMadeTraffic Logo"
                                    />
                                    <CardContent>
                                        <Typography gutterBottom variant="h5" component="h2">
                                            Software Development
                                            <Typography gutterBottom variant="caption" component="h5">
                                                <a href={"https://taylormadetraffic.com"} target="_blank" rel="noopener noreferrer">TaylorMadeTraffic.com</a>
                                            </Typography>
                                        </Typography>

                                        <Typography variant="body2" color="textSecondary" component="p">
                                            Offering our software development consulting and coding services in exchange for CitizeCoin or your help with any of the <a
                                            href={"https://github.com/eliataylor/clock-agendas/issues"} target="_blank"
                                            rel="noopener noreferrer">Issues</a> on this site.
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                                <CardActions style={{justifyContent: 'space-between'}}>
                                    <Button size="small" color="primary"
                                            onClick={() => this.redeem('eli@taylormadetraffic.com')}>Redeem</Button>
                                </CardActions>
                            </Card>
                        </Grid>


                        <Grid item xs={12} sm={6} md={4}>
                            <Card>
                                <CardActionArea>
                                    <CardMedia
                                        component="img"
                                        alt="Polina Logo"
                                        height="150"
                                        image="/images/polina-banner.jpg"
                                        title="Polina Logo"
                                    />
                                    <CardContent>
                                        <Typography gutterBottom variant="h5" component="h2">
                                            Online marketing consulting
                                            <Typography gutterBottom variant="caption" component="h5">
                                                <a href={"https://www.linkedin.com/in/polina-tolkacheva-6548604"} target="_blank" rel="noopener noreferrer">LinkedIn/polina</a>
                                            </Typography>

                                        </Typography>
                                        <Typography variant="body2" color="textSecondary" component="p">
                                            Offering 1 hour consultations to review existing and come up with new online marketing strategies
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                                <CardActions style={{justifyContent: 'space-between'}}>
                                    <Button size="small" color="primary"
                                            onClick={() => this.redeem('polina@omuze.com')}>Redeem</Button>
                                </CardActions>
                            </Card>
                        </Grid>


                        <Grid item xs={12} sm={6} md={4}>
                            <Card>
                                <CardActionArea>
                                    <CardMedia
                                        component="img"
                                        alt="Indy Logo"
                                        height="200"
                                        image="/images/Indy-Rishi-Singh-playing-flute.jpg"
                                        title="Indy Logo"
                                    />
                                    <CardContent>
                                        <Typography gutterBottom variant="h5" component="h2">
                                            Meditation &amp; Breath-work
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary" component="p">
                                            Offering 1 hour sessions in meditation, breath work, and laughter.
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                                <CardActions style={{justifyContent: 'space-between'}}>
                                    <Button size="small" color="primary"
                                            onClick={() => this.redeem('indyrishisingh111@gmail.com')}>Redeem</Button>
                                </CardActions>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <Card>
                                <CardActionArea>
                                    <CardMedia
                                        component="img"
                                        alt="Indy Logo"
                                        height="200"
                                        image="/images/Indy-neuroplasticity-assembly-miraleste.jpg"
                                        title="Indy Logo"
                                    />
                                    <CardContent>
                                        <Typography gutterBottom variant="h5" component="h2">
                                            Tutoring for various subjects
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary" component="p">
                                            Offering tutoring in Math, Sciences, Writing, Grammar, PE, social emotional learning &amp; website design.
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                                <CardActions style={{justifyContent: 'space-between'}}>
                                    <Button size="small" color="primary"
                                            onClick={() => this.redeem('indyrishisingh111@gmail.com')}>Redeem</Button>
                                </CardActions>
                            </Card>
                        </Grid>





                    </Grid>
                </Box> */}
            </Box>
        );
    }

}


const useStyles = theme => ({
    root: {
        width: '100%',
    },
    blueSection: {
        background: theme.palette.secondary.main,
        padding: '20px 70px'
    },
    blueSectionTitle: {
        marginBottom: '10px'
    },
    blueSectionSubtitle: {
        marginBottom: '20px',
        fontWeight: 'normal',
        width: '75%'
    },
    blueSectionItemText: {
        width: '50%',
        color: 'gray'
    },
    blueSectionItemImg: {
        marginRight: '10px'
    },
    blueSectionLeftButton: {
        border: `1px solid ${theme.palette.error.main}`,
        color: theme.palette.error.main,
        textTransform: 'none',
        marginRight: '15px',
        padding: "5px 10px"

    },
    blueSectionRightButton: {
        background: theme.palette.error.main,
        color: 'white',
        textTransform: 'none',
        padding: "5px 20px"
    },
    blueSectionHero: {
        width: "150px",
        height: "200px"
    },
    blueSectionItemsContainer: {
        marginBottom: '15px'
    }
});

export default withStyles(useStyles, {withTheme: true})(withSnackbar(Resources));
