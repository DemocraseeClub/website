import React from "react";
import {withStyles} from "@material-ui/core/styles";
import {rallyStyles} from "../Util/ThemeUtils";
import {withSnackbar} from "notistack";
import {Card, CardActions, CardContent, CardMedia,} from "@material-ui/core";
import CardActionArea from "@material-ui/core/CardActionArea";
import Button from "@material-ui/core/Button";
import {NavLink} from "react-router-dom";
import Typography from "@material-ui/core/Typography";
import Config from "../Config";
import SanitizedHTML from "react-sanitized-html";

class RallyItem extends React.Component {


    trackSubscribe(id) {
        this.props.enqueueSnackbar(
            "We track clicks on this to prioritize development and schedule. Please only click once for any rallies you are interested in"
        );
        window.logUse.logEvent("rally-subscribe", {id: id});
    }

    render() {
        const {classes, item} = this.props;

        return (
            <Card className={classes.card}>
                <CardContent>
                    <NavLink to={`/rally/${item.id}`}>
                        <img
                            className={classes.cardMedia}
                            component="img"
                            alt={item.title}
                            src={item.picture}
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
                                html={item.description}
                            />
                        </Typography>
                    </CardContent>
                </CardContent>
                <CardActions style={{justifyContent: "space-between"}}>
                    <NavLink to={`/rally/${item.id}`}>
                        <Button
                            size="small"
                            color="primary"
                            style={{minWidth: "auto"}}
                        >
                            View
                        </Button>
                    </NavLink>
                    <Button
                        size="small"
                        color="primary"
                        onClick={() => this.trackSubscribe(`/rally/${item.id}`)}
                    >
                        Subscribe
                    </Button>
                </CardActions>
            </Card>)
    }
}

export default withStyles(rallyStyles, {withTheme: true})(withSnackbar(RallyItem));
