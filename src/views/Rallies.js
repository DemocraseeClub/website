import React from "react";
import {withStyles} from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import {NavLink} from "react-router-dom";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Button from "@material-ui/core/Button";
import {withSnackbar} from "notistack";
import {rallyStyles} from "../Util/ThemeUtils";
import Skeleton from "@material-ui/lab/Skeleton";
import Config from "../Config";
import SanitizedHTML from "react-sanitized-html";
import {withRouter} from "react-router";
import {withCmsHooks} from "./firebaseCMS/FirebaseCMS";

class Rallies extends React.Component {
    constructor(p) {
        super(p);
        this.state = {
            error: false,
            loading: true,
            rallies: [],
        };
    }

    componentWillMount() {
        fetch(process.env.REACT_APP_FUNCTIONS_URL + "/rallies")
            .then((response) => response.json())
            .then(async (data) => {
                for (let i = 0; i < data.length; i++) {
                    try {
                        if (data[i].picture) {
                            let path = window.storage.ref(data[i].picture);
                            const url = await path.getDownloadURL();
                            data[i].picture = url;
                        }
                    } catch (e) {
                    }
                }
                this.setState({rallies: data, loading: false});
                return data;
            })
            .catch((err) => console.log(err));
    }

    trackSubscribe(id) {
        this.props.enqueueSnackbar(
            "We track clicks on this to prioritize development and schedule. Please only click once for any rallies you are interested in"
        );
        window.logUse.logEvent("rally-subscribe", {id: id});
    }

    showRallyForm() {
        if (this.props.authController && this.props.authController.loggedUser) {
            console.log(this.props.authContext, this.props.sideEntityController.sidePanels);
            this.props.sideEntityController.open({collectionPath: "/rallies"});
        } else {
            this.props.history.push('/login')
        }

    }

    render() {
        const {loading} = this.state;

        return (
            <Box p={4} className={this.props.classes.section}>
                <Grid container justify={'space-between'} align={'center'} style={{marginBottom:10}} >
                    <Grid item>
                        <Typography variant={"h3"}>Rallying</Typography>
                    </Grid>
                    <Grid item>
                        <NavLink to={"/rally/templates"} style={{textDecoration: "none", marginRight: 5}} >
                            <Button variant={"contained"} color={"secondary"}>
                                Rally Templates
                            </Button>
                        </NavLink>

                        <Button
                            variant={"contained"}
                            className={this.props.classes.redBtn}
                            onClick={() => this.showRallyForm()}
                        >
                            Start a Rally
                        </Button>
                    </Grid>
                </Grid>

                <Grid
                    container
                    justify={"space-around"}
                    spacing={4}
                    alignItems="stretch"
                >
                    {loading === true ? [1, 2, 3, 4, 5, 6].map(
                        (num, key) => (
                            <Grid key={'rskeleton' + key} item xs={12} sm={6} md={4}>
                                <Card style={{height: "100%"}}>
                                    <CardActionArea>
                                        <Skeleton variant="rect" width="100%" height={200}/>
                                        <CardContent>
                                            <Skeleton width="40%"/>
                                            <Skeleton/>
                                            <Skeleton/>
                                            <Skeleton/>
                                        </CardContent>
                                    </CardActionArea>
                                    <CardActions style={{justifyContent: "space-between"}}>
                                        <Button size="small" color="primary">
                                            View
                                        </Button>
                                        <Button size="small" color="primary">
                                            Subscribe
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        )
                        )
                        : this.state.rallies.map(
                            (item, key) => (
                                <Grid key={'rally' + key} item xs={12} sm={6} md={4}>
                                    <Card style={{height: "100%"}}>
                                        <CardActionArea>
                                            <NavLink to={`/rally/${item.id}`}>
                                                <CardMedia
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = "images/citizencoin.png";
                                                    }
                                                    }
                                                    component="img"
                                                    alt={item.title}
                                                    height="200"
                                                    style={{objectFit: "contain"}}
                                                    image={item.picture}
                                                />
                                            </NavLink>
                                            <CardContent>
                                                <Typography gutterBottom variant="h4" component="h2">
                                                    {item.title}
                                                </Typography>
                                                <Typography variant="body2" component="div">
                                                    <SanitizedHTML
                                                        allowedTags={Config.allowedTags}
                                                        allowedAttributes={Config.allowedAttributes}
                                                        html={item.description}/>
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                        <CardActions style={{justifyContent: "space-between", padding: '0 10px'}}>
                                            <NavLink to={`/rally/${item.id}`}>
                                                <Button size="small" color="primary" style={{minWidth: "auto"}}>
                                                    View
                                                </Button>
                                            </NavLink>
                                            <Button size="small" color="primary"
                                                    onClick={() => this.trackSubscribe(`/rally/${item.id}`)}>
                                                Subscribe
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            )
                        )}
                </Grid>
            </Box>
        );
    }
}

export default withStyles(rallyStyles)(withSnackbar(withCmsHooks(withRouter(Rallies))));
