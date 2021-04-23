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
import List from "@material-ui/core/List";
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
                <Typography variant={'h2'}>How to help build this platform?</Typography>

                <br />

                <Typography variant={'body2'}>
                    This site and all its tools are available on <a href={"https://github.com/eliataylor/clock-agendas"} target={"_blank"}>Github</a>.
                    and available via the <a href={"https://www.gnu.org/licenses/gpl-3.0.html"} target={"_blank"}>GNU License</a>.
                    Feel free to fork the code and publish this platform for another Country than the USA.
                </Typography>

                <br />

                <Typography variant={'body2'}>
                    Choices for spending this fund are made by our <NavLink to={'/about'}>Board</NavLink>.
                    If you would like to earn from your code contributions, please comment on any of our
                    existing <a href={"https://github.com/eliataylor/clock-agendas/issues?q=is%3Aopen+is%3Aissue"} target={"_blank"}>Issues</a> and
                    we'll discuss a fair rate.
                </Typography>
            </div>)
        } else if (type === 'citizencoin') {
            return (<div>
                    <Typography variant={'h2'} onClick={() => this.setState({showDialog: 'citizencoin'})}>
                        <img src={"/images/citizencoin.png"} alt={"citizen coin"} height={40} style={{marginRight:10}} />
                        How to earn CitizenCoin?
                    </Typography>
                    <List>
                        <ListItem>
                            <ListItemIcon>
                                <img src="/images/roundtable.svg" alt='Roundtable' height={25} />
                            </ListItemIcon>
                            <ListItemText primary={"Host a Rally"} secondary={"Earns $20"}/>
                        </ListItem>

                        <ListItem>
                            <ListItemIcon>
                                <img src="/images/campaign_black_24dp.svg" alt='Campaign speaker' />
                            </ListItemIcon>
                            <ListItemText primary={"Speak at a Rally Meeting"} secondary={"Earns $15"}/>
                        </ListItem>

                        <ListItem>
                            <ListItemIcon>
                                <img src="/images/volunteer_activism_black_24dp.svg" alt='Volunteer' />
                            </ListItemIcon>
                            <ListItemText primary={"Offer Office Hours"} secondary={"Earns $5 / hour"}/>
                        </ListItem>
                    </List>

                    <Typography variant={'body2'}>
                        You may also receive promotional offers to earn CitizenCoin just for your participation in rallies and
                        office hours, or just promoting the platform.
                    </Typography>
                </div>
            )
        } else if (type === 'resources') {
            return (<div>
                <Typography variant={'h2'} onClick={() => this.setState({showDialog: 'citizencoin'})}>
                    What Resources can I sell or offer?
                </Typography>

                <List>
                    <ListItem>
                        <ListItemIcon><img src="/images/volunteer_activism_black_24dp.svg" alt='Volunteer' /></ListItemIcon>
                        <ListItemText primary={"Legal Consul, Technical Writing, Graphic Design, Sales support, Digital Marketing, Manual Labor, Professional Services..."} secondary={"& anything that can help someone fulfill their mission"} />
                    </ListItem>

                </List>

                <Typography variant={'h2'} onClick={() => this.setState({showDialog: 'citizencoin'})}>What can I not offer?</Typography>

                <List>
                    <ListItem>
                        <ListItemIcon></ListItemIcon>
                        <ListItemText primary={"Products"} secondary={"If you distribute raw material goods that support our Rallies, please add them as 'Raw Materials'"} />
                    </ListItem>
                </List>

            </div>)
        }

        return type;
    }

    render() {
        return (
            <Box p={4}>

                <Box mb={4}>
                    <Grid container alignContent={'center'} justify={'space-between'} alignItems={'center'} spacing={2}>
                        <Grid item>
                            <CitySelector/>
                        </Grid>

                        <Grid item style={{flexGrow:1}}>
                        <Select value={this.state.level} onChange={e => this.handleSponsorshipLevel(e)}
                                displayEmpty={true} fullWidth={true} >
                            <MenuItem value={''}>Contribute</MenuItem>
                            <MenuItem value={'civic'}>Civic Sponsor: ($1 / month)</MenuItem>
                            <MenuItem value={'county'}>County Sponsor: ($25 / year)</MenuItem>
                            <MenuItem value={'regional'}>Regional Sponsors: ($100 / year) </MenuItem>
                        </Select>
                        </Grid>

                        <Grid item>
                            <Button variant={'contained'} className={this.props.classes.redBtn}>Sponsor</Button>
                        </Grid>
                    </Grid>
                </Box>

                <Box mb={4}>
                    <Typography variant={'h5'} color={'error'} style={{textAlign: 'center'}}>Where your money goes:</Typography>

                    <Grid container alignContent={'center'} justify={'space-between'} alignItems={'flex-start'}
                          spacing={2}>
                        <Grid item xs={6} style={{textAlign: "center"}}>
                            <Typography variant={'h5'} color={'error'}>50%</Typography>
                            <Typography variant={'h3'} color={'primary'}>CitizenCoin & Resource payouts</Typography>
                            <Typography variant={'body1'}>We pay you <u
                                onClick={() => this.setState({showDialog: 'citizencoin'})}>CitizenCoin</u> so you can
                                pay for <u onClick={() => this.setState({showDialog: 'resources'})}>Resources</u> that
                                invest in the outcomes and action plans of your Rallies.</Typography>
                            <br/>
                            <NavLink to={'/c/resources#new'} style={{textDecoration: 'none'}}>
                                <Button disableElevation={true} variant={'contained'} color={'secondary'}
                                        size={'small'}>Offer your services</Button>
                            </NavLink>
                        </Grid>
                        <Grid item xs={6} style={{textAlign: "center"}}>
                            <Typography variant={'h5'} color={'error'}>50%</Typography>
                            <Typography variant={'h3'} color={'primary'}>Platform hosting, design, writing, counsel & software
                                development</Typography>
                            <Typography variant={'body1'}>We collectively fund this platform, so it will always remain <u
                                onClick={() => this.setState({showDialog: 'opensource'})}>Open Source</u> and <u
                                onClick={() => this.setState({showDialog: 'opensource'})}>Community
                                Developed</u>.
                            </Typography>
                        </Grid>
                    </Grid>

                </Box>

                <Grid container justify={'space-around'} spacing={4}>
                    {CITIES.map((o, i) => {
                        return (<Grid item xs={12} sm={6} md={3} key={'citysponsor'+i}>
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
                                            <ListItemText primary={user.name} secondary={'Civic Sponsor'}/>
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
