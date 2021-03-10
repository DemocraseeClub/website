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
import Button from '@material-ui/core/Button';
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import Avatar from "@material-ui/core/Avatar";
import {withSnackbar} from "notistack";
import {TEAM} from './About';
import CitySelector from "../components/CitySelector";
import TextField from "@material-ui/core/TextField";

const CITIES = [
    {
        name: 'Sacramento',
        state: 'California',
        img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Seal_of_Sacramento%2C_California.png/480px-Seal_of_Sacramento%2C_California.png',
        sponsors: [TEAM[2]]
    },
    {
        name: 'Los Angeles',
        state: 'California',
        img: 'https://api.trackauthoritymusic.com/sites/default/files/styles/thumbnail/public/groups/covers/losangeles.png?itok=TPdz0nWS',
        sponsors: [TEAM[0]]
    },
    {
        name: 'San Mateo',
        state: 'California',
        img: 'https://www.smcgov.org/profiles/sanmateo/themes/smc_base/images/SMC_Seal_2018.png',
        sponsors: [TEAM[1]]
    },
    {
        name: 'Alameda',
        state: 'California',
        img: 'https://api.trackauthoritymusic.com/sites/default/files/styles/thumbnail/public/groups/covers/alameda.png?itok=RLmkyadr',
        sponsors: [TEAM[3]]
    }
]

class Sponsors extends React.Component {
    constructor(props) {
        super(props);
        this.state = {dollars: 1}
    }


    trackSubscribe(id) {
        this.props.enqueueSnackbar('We track clicks on this to prioritize development and schedule. Please only click once for any rallies you are interested in');
        window.logUse.logEvent('rally-subscribe', {'id': id});
    }

    render() {
        return (
            <Box p={4}>

                <Box mb={4}>
                    <Grid container alignContent={'center'} justify={'space-between'} alignItems={'center'}>
                        <Grid item>
                            <CitySelector/>
                        </Grid>
                        <Grid item>
                            <TextField name="dollars" label="$ / Month" type="number"
                                       value={this.state.dollars}
                                       onChange={e => this.setState({dollars: e.target.value})}
                                       variant={'standard'}
                                       InputLabelProps={{
                                           shrink: true
                                       }}/>
                        </Grid>
                        <Grid item>
                            <Button variant={'contained'} className={this.props.classes.redBtn}>Sponsor your
                                City</Button>
                        </Grid>
                    </Grid>
                </Box>
                <Box mb={4}>
                    <Typography variant={'h3'}>Sponsors</Typography>
                    <Typography variant={'body2'}>Your funds go to development and a <em>minimum</em> of 25% is reinvest
                        in your rallies through CitizenCoin payouts</Typography>
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
