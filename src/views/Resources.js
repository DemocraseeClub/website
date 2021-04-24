import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import {withSnackbar} from 'notistack';
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import Box from "@material-ui/core/Box";
import Avatar from '@material-ui/core/Avatar';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import SearchIcon from '@material-ui/icons/Search';
import InputAdornment from '@material-ui/core/InputAdornment';

class Resources extends React.Component {

    redeem(email) {
        this.props.enqueueSnackbar('Email: ' + email);
        window.logUse.logEvent('resource-redeem', {email: email});
    }

    render() {
        const { classes } = this.props

        const currencies = [
            {
                value: 'USD',
                label: '$',
            },
            {
                value: 'EUR',
                label: '€',
            },
            {
                value: 'BTC',
                label: '฿',
            },
            {
                value: 'JPY',
                label: '¥',
            },
        ];

        const cards = [
            {
                image: "/images/democrasee_logo_black.png",
                badge: "Technology",
                title: "1 Hour Online Marketing Consultation",
                subtitle: "with Polina Tolkacheva",
                links: [ "Nov 13-6:30pm", "Nov 16-6:30pm"]
            },
            {
                image: "/images/democrasee_logo_black.png",
                badge: "Law & Justice",
                title: "Legal Help with writing an action plan",
                subtitle: "with Inner City Law",
                links: [ "Schedule Meeting"]
            },
            {
                image: "/images/democrasee_logo_black.png",
                badge: "Law & Justice",
                title: "Homelessness, Domestic Violence Hotline",
                subtitle: "with The People Concern",
                links: [ "Schedule Meeting"]
            }
        ]
        return (
            <Box>
                <Grid container className={classes.blueSection}>
                    <Grid item xs={8}>
                        <Typography variant={'h5'} className={classes.blueSectionTitle}><b>Request and Receive Help From Your Community</b></Typography>
                        <Typography variant={'h6'} className={classes.blueSectionSubtitle}> All action with plans will receive a percentage of the current city pot of <b>2000 Citize Coins</b></Typography>
                        <Grid container spacing={3} className={classes.blueSectionItemsContainer }>
                            <Grid item>
                                <Box display="flex" alignItems="center">
                                    <Avatar src="/images/coin.png" className={classes.blueSectionItemImg} alt="citizen-coin"/>
                                    <Typography variant={'body2'} className={classes.blueSectionItemText}><b>Earn 2 - 2000 Citizen Coins</b></Typography>
                                </Box>
                            </Grid>
                            <Grid item>
                                <Box display="flex" alignItems="center">
                                    <Avatar src="/images/hero.jpg" className={classes.blueSectionItemImg} alt="hero-badge"/>
                                    <Typography variant={'body2'} className={classes.blueSectionItemText}><b>Explorer or Hero Badge</b></Typography>
                                </Box>
                            </Grid>
                            <Grid item>
                                <Box display="flex" alignItems="center">
                                    <Avatar src="/images/lighbulb.png" className={classes.blueSectionItemImg} alt="Time-knowledge"/>
                                    <Typography variant={'body2'} className={classes.blueSectionItemText}><b>Time and Knowledge</b></Typography>
                                </Box>
                            </Grid>
                        </Grid>
                        <Button variant="outlined" className={classes.blueSectionLeftButton}>Request Help</Button>
                        <Button className={classes.blueSectionRightButton}>Offer Your Expertise</Button>
                    </Grid>
                    <Grid item xs={4}>
                        <Box display="flex" alignItems="center" justifyContent="center">
                            <img src="/images/lighbulb.png" alt="blueSection-hero" className={classes.blueSectionHero}/>
                        </Box>
                    </Grid>
                </Grid>
                <Box className={classes.whiteSection}>
                    <Grid container>
                        <Grid item xs={5}>
                            <Typography variant={'h4'}>Local Resources</Typography>
                        </Grid>
                        <Grid item xs={7}>
                            <Grid container spacing={1} justify="flex-end"  >
                                <Grid item>
                                    <TextField
                                        id="standard-multiline-flexible"
                                        label="Search"
                                        size="medium"
                                        variant="outlined"
                                        InputProps={{
                                            endAdornment : <InputAdornment position="end">
                                                                <SearchIcon/>
                                                            </InputAdornment>
                                        }}
                                    />
                                </Grid>
                                <Grid item>
                                    <TextField
                                        className={classes.whiteSectionSelect}
                                        id="standard-select-currency"
                                        select
                                        label="Filter"
                                        size="medium"
                                        variant="outlined"
                                    >
                                    {currencies.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                    ))}
                                </TextField>
                                </Grid>
                                <Grid item>
                                    <TextField
                                        className={classes.whiteSectionSelect}
                                        id="standard-select-currency"
                                        select
                                        label="Sort by"
                                        size="medium"
                                        variant="outlined"
                                    >
                                        {currencies.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid container spacing={10} justify="center" className={classes.cardsContainer}>
                        {
                            cards.map(item =>
                                <Grid item key={item.title}>
                                    <Card className={classes.card}>
                                        <Grid container justify="space-between" alignItems="center" className={classes.cardHeader}>
                                            <Grid item >
                                                <Avatar src={item.image} alt="card-img" className={classes.cardImg}/>
                                            </Grid>
                                            <Grid item>
                                                <Button className={classes.cardButton}>View</Button>
                                            </Grid>
                                        </Grid>
                                        <Typography variant={'body2'} className={classes.cardBadge}>{item.badge}</Typography>
                                        <Typography variant={'body1'}><b>{item.title}</b></Typography>
                                        <Typography variant={'body1'} className={classes.cardSubtitle}>{item.subtitle}</Typography>
                                        {
                                            item.links.map(link => <Typography variant={'body1'} className={classes.cardLink} key={link}>{link}</Typography>)
                                        }
                                    </Card>
                                </Grid>)
                        }
                    </Grid>
                    <Grid container className={classes.helpSection}>
                        <Grid item xs={5}>
                            <Typography variant={'h4'}>Request for Help</Typography>
                        </Grid>
                        <Grid item xs={7}>
                            <Grid container spacing={1} justify="flex-end"  >
                                <Grid item>
                                    <TextField
                                        id="standard-multiline-flexible"
                                        label="Search"
                                        size="medium"
                                        variant="outlined"
                                        InputProps={{
                                            endAdornment : <InputAdornment position="end">
                                                                <SearchIcon/>
                                                            </InputAdornment>
                                        }}
                                    />
                                </Grid>
                                <Grid item>
                                    <TextField
                                        className={classes.whiteSectionSelect}
                                        id="standard-select-currency"
                                        select
                                        label="Filter"
                                        size="medium"
                                        variant="outlined"
                                    >
                                    {currencies.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                    ))}
                                </TextField>
                                </Grid>
                                <Grid item>
                                    <TextField
                                        className={classes.whiteSectionSelect}
                                        id="standard-select-currency"
                                        select
                                        label="Sort by"
                                        size="medium"
                                        variant="outlined"
                                    >
                                        {currencies.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid container justify="space-between" alignItems="center" className={classes.helpSectionFooter}>
                        <Grid item className={classes.helpSectionLinkContainer}>
                            <Avatar src="/images/indy.png" alt="card-img" className={classes.cardImg}/>
                            <Typography variant={'body1'} className={classes.helpSectionLink}>Need Volunters for Upcoming Rally on Nov 16th</Typography>
                        </Grid>
                        <Grid item>
                            <Button variant="outlined" color="primary" className={classes.helpSectionButton}>Offer Help</Button>
                        </Grid>
                    </Grid>
                </Box>
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
        padding: '50px 70px'
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
        padding: "5px 20px",
        '&:hover': {
            background: theme.palette.error.main,
            color: 'white',
        },
    },
    blueSectionHero: {
        height: "200px"
    },
    blueSectionItemsContainer: {
        marginBottom: '15px'
    },
    whiteSection: {
        padding: '60px 70px'
    },
    whiteSectionSelect: {
        width: '15ch'
    },
    whiteSectionInput: {
        width: '20ch'
    },
    cardsContainer: {
        marginTop: '10px'
    },
    card: {
        padding: '25px'
    },
    cardImg: {
        width: '80px',
        height: '80px',
    },
    cardButton: {
        padding: '10px 40px',
        background: theme.palette.info.main,
        color: 'white',
        textTransform: 'none',
        '&:hover': {
            background: theme.palette.info.main,
            color: 'white',
        },
    },
    cardHeader: {
        marginBottom: '15px'
    },
    cardSubtitle: {
        marginBottom: '15px'
    },
    cardLink: {
        color: theme.palette.info.main,
        textDecoration: 'underline'
    },
    cardBadge: {
        color: 'gray',
        margin: '-10px 0 10px 0'
    },
    helpSection: {
        marginTop: '90px'
    },
    helpSectionLinkContainer: {
        display: 'flex',
        alignItems: 'center'
    },
    helpSectionLink: {
        color: theme.palette.info.main,
        textDecoration: 'underline',
        marginLeft: '100px'
    },
    helpSectionFooter: {
        marginTop: '50px'
    },
    helpSectionButton: {
        padding: '10px 40px',
        border: `1px solid ${theme.palette.info.main}`,
        color: theme.palette.info.main,
        textTransform: 'none',
    }

});

export default withStyles(useStyles, {withTheme: true})(withSnackbar(Resources));
