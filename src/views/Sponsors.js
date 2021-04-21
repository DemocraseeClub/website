import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import Avatar from "@material-ui/core/Avatar";
import {withSnackbar} from "notistack";
import CitySelector from "../components/CitySelector";
import Dialog from '@material-ui/core/Dialog';
import {BrowserRouter as Router, NavLink} from "react-router-dom";

const CITIES = [
    {
        name: 'Sacramento',
        state: 'California',
        img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Seal_of_Sacramento%2C_California.png/480px-Seal_of_Sacramento%2C_California.png',
        sponsors: [{
            name: "Eli",
            img: "/images/eli.png"
        }]
    },
    {
        name: 'Los Angeles',
        state: 'California',
        img: 'https://api.trackauthoritymusic.com/sites/default/files/styles/thumbnail/public/groups/covers/losangeles.png?itok=TPdz0nWS',
        sponsors: [{
            name: "Polina",
            img: "/images/polina.png"
        }]
    },
    {
        name: 'San Mateo',
        state: 'California',
        img: 'https://www.smcgov.org/profiles/sanmateo/themes/smc_base/images/SMC_Seal_2018.png',
        sponsors: [{
            name: "Marcela",
            img: "/images/marcela.png"
        }]
    },
    {
        name: 'Alameda',
        state: 'California',
        img: 'https://api.trackauthoritymusic.com/sites/default/files/styles/thumbnail/public/groups/covers/alameda.png?itok=RLmkyadr',
        sponsors: [{
            name: "Indy",
            img: "/images/indy.png"
        }]
    }
]

class Sponsors extends React.Component {
    constructor(props) {
        super(props);
        this.state = {dollars: 1, level: '', showDialog: false}
    }


    trackSubscribe(id) {
        this.props.enqueueSnackbar('We track clicks on this to prioritize development and schedule. Please only click once for any rallies you are interested in');
        window.logUse.logEvent('rally-subscribe', {'id': id});
    }

    handleSponsorshipLevel(e) {
        e.preventDefault();
        this.setState({level: e.currentTarget.value, showDialog: 'sponsorlevel'})
    }

    renderDialog(type) {
        if (type === 'sponsorlevel') {

        } else if (type === 'opensource') {
            return (<div>
                <Typography variant={'button'}>How to help build this platform?</Typography>
                <Typography variant={'body2'}>
                    This site and all its tools are available Open Source under the GNU License.
                </Typography>
                <Typography variant={'body2'}>
                    After Hosting services are paid, we
                    https://github.com/eliataylor/clock-agendas/issues?q=is%3Aopen+is%3Aissue
                    https://github.com/eliataylor/clock-agendas - README.md
                </Typography>
                <Typography variant={'body2'}>
                spending choices are controlled by our Board - http://localhost:3000/about
                </Typography>
            </div>)
        } else if (type === 'citizencoin') {
            return (<div>
                <Typography variant={'h2'} onClick={() => this.setState({showDialog: 'citizencoin'})}>How to earn CitizenCoin?</Typography>
                    <Typography variant={'body2'}>
                        Speak at a Rally Meeting - $10
                    </Typography>
                    <Typography variant={'body2'}>

                    </Typography>
                </div>
                )
        } else if (type === 'resources') {
            return (<div>
                <Typography variant={'h2'} onClick={() => this.setState({showDialog: 'citizencoin'})}>What Resources can I Offer?</Typography>

            </div>)
        }

        return type;
    }

    render() {
        return (
            <Box p={4}>

                <Box mb={4}>
                    <Grid container alignContent={'center'} justify={'space-between'} alignItems={'center'}>
                        <Grid item>
                            <CitySelector/>
                        </Grid>

                        <Select value={this.state.level} onChange={e => this.handleSponsorshipLevel(e)}
                                displayEmpty={true}>
                            <MenuItem value={''}>Contribute</MenuItem>
                            <MenuItem value={'civic'}>Civic Sponsor: ($1 / month)</MenuItem>
                            <MenuItem value={'county'}>County Sponsor: ($25 / year)</MenuItem>
                            <MenuItem value={'regional'}>Regional Sponsors: ($100 / year) </MenuItem>
                        </Select>

                        <Grid item>
                            <Button variant={'contained'} className={this.props.classes.redBtn}>Sponsor</Button>
                        </Grid>
                    </Grid>
                </Box>

                <Box mb={4}>
                    <Typography variant={'h6'} style={{textAlign: 'center'}}>Where your money goes?</Typography>

                    <Grid container alignContent={'center'} justify={'space-between'} alignItems={'flex-start'} spacing={2}>
                        <Grid item xs={6} style={{textAlign:"center"}}>
                            <Typography variant={'h1'}>50%</Typography>
                            <Typography variant={'h4'}>CitizenCoin & Resource payouts</Typography>
                            <Typography variant={'body2'}>We pay you <u onClick={() => this.setState({showDialog: 'citizencoin'})}>CitizenCoin</u> so you can pay for <u onClick={() => this.setState({showDialog: 'resources'})}>Resources</u> that invest in the outcomes and action plans of your Rallies.</Typography>
                            <br />
                            <NavLink to={'/c/resources#new'} style={{textDecoration:'none'}}>
                                <Button disableElevation={true} variant={'contained'} color={'secondary'} size={'small'}>Offer your services</Button>
                            </NavLink>
                        </Grid>
                        <Grid item xs={6} style={{textAlign:"center"}}>
                            <Typography variant={'h1'}>50%</Typography>
                            <Typography variant={'h4'}>Platform Hosting, Design, Writing, Counsel & Software Development</Typography>
                            <Typography variant={'body2'}>We all fund this platform so it will remain <u onClick={() => this.setState({showDialog: 'opensource'})}>Open Source</u> and <u onClick={() => this.setState({showDialog: 'opensource'})}>Community Developed</u>.</Typography>
                        </Grid>
                    </Grid>

                </Box>

                <Grid container justify={'space-around'} spacing={4}>
                    {CITIES.map((o, i) => {
                        return (<Grid item xs={12} sm={6} md={4}>
                            <Card>
                                <CardActionArea>
                                    <CardMedia
                                        component="img"
                                        alt={o.name}
                                        height="200"
                                        style={{objectFit: 'contain'}}
                                        image={o.img}
                                        title={o.name}
                                    />
                                    <CardContent>
                                        <Typography gutterBottom variant="h5" component="h2">
                                            {o.name}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                                <CardActions style={{justifyContent: 'space-between'}}>
                                    {o.sponsors.map((user, ui) => {
                                        return (<ListItem key={ui + '-sponsor-' + o.name}>
                                            <ListItemIcon>
                                                <Avatar variant={'circular'} aria-label="tool" src={user.img}
                                                        alt={user.name}/>
                                            </ListItemIcon>
                                            <ListItemText primary={user.name} secondary={'March sponsor'}/>
                                        </ListItem>)
                                    })}
                                </CardActions>
                            </Card>
                        </Grid>)
                    })}

                </Grid>

                <Dialog open={this.state.showDialog !== false}>
                    <div style={{padding: 30}}>
                        <p style={{textAlign: 'right', marginBottom: 30}}>
                            <Button color='primary' variant='contained'
                                    onClick={() => this.setState({showDialog: false})}>Close</Button>
                        </p>
                        {this.renderDialog(this.state.showDialog)}
                    </div>
                </Dialog>

            </Box>
        );
    }

}


const useStyles = theme => ({
    root: {
        width: '100%',
    },
    redBtn: {
        backgroundColor: theme.palette.error.main,
        color: theme.palette.error.contrastText,
        textDecoration: 'none!important'
    }
});

export default withStyles(useStyles, {withTheme: true})(withSnackbar(Sponsors));
