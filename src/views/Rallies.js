import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import {NavLink} from "react-router-dom";
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';

class Rallies extends React.Component {

    render() {
        return (
            <Box m={4} >
                <Typography variant={'subtitle1'}>Rallying</Typography>
                <Grid container justify={'space-around'} spacing={4}>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card>
                            <CardActionArea>
                                <NavLink to={'/rally/building-democrasee'}><CardMedia
                                    component="img"
                                    alt="Democrasee Logo"
                                    height="200"
                                    style={{objectFit:'contain'}}
                                    image="/images/democrasee_logo_black.png"
                                    title="Democrasee Logo"
                                /></NavLink>
                                <CardContent>
                                    <Typography gutterBottom variant="h5" component="h2">
                                        Building Democrasee
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" component="p">
                                        Open sourcing our development for a constructive solution to our biggest challenges
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                            <CardActions>
                                <NavLink to={'/rally/building-democrasee'}><Button size="small" color="primary">
                                    View
                                </Button></NavLink>
                            </CardActions>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                        <Card>
                            <CardActionArea>
                                <NavLink to={'/rally/hgp'}><CardMedia
                                    component="img"
                                    alt="HGP Logo"
                                    height="200"
                                    style={{objectFit:'contain'}}
                                    image="https://www.hiddengeniusproject.org/wp-content/uploads/2018/01/HGPAssets_SecondaryLogo_Yellow-7-e1515176540614.png"
                                    title="HGP Logo"
                                /></NavLink>
                                <CardContent>
                                    <Typography gutterBottom variant="h5" component="h2">
                                        Hidden Genius Project
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" component="p">
                                        Course touch for Alumni Venture Seed Fund
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                            <CardActions>
                                <NavLink to={'/rally/hgp'}><Button size="small" color="primary">
                                    View
                                </Button></NavLink>
                            </CardActions>
                        </Card>
                    </Grid>


                    <Grid item xs={12} sm={6} md={4}>
                        <Card>
                            <CardActionArea>
                                <NavLink to={'/rally/fighting-defamation'}><CardMedia
                                    component="img"
                                    alt="Libel"
                                    height="200"
                                    style={{objectFit:'contain'}}
                                    image="https://democrasee.club/wp-content/uploads/2020/10/libel-150x150.jpg"
                                    title="Libel"
                                /></NavLink>
                                <CardContent>
                                    <Typography gutterBottom variant="h5" component="h2">
                                        Fighting Defamation
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" component="p">
                                        Course touch for Alumni Venture Seed Fund
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                            <CardActions>
                                <NavLink to={'/rally/fighting-defamation'}><Button size="small" color="primary">
                                    View
                                </Button></NavLink>
                            </CardActions>
                        </Card>
                    </Grid>

                </Grid>
                <Box mt={10} >
                    <NavLink to={'/rally/templates'}>Create a Rally</NavLink>
                </Box>
            </Box>
        );
    }

}


const useStyles = theme => ({
    root: {
        width: '100%',
    }
});

export default withStyles(useStyles, {withTheme:true})(Rallies);
