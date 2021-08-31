import React from "react";
import {withStyles} from "@material-ui/core/styles";
import {rallyStyles} from "../Util/ThemeUtils";
import {withSnackbar} from "notistack";
import {Card, CardActions, CardContent} from "@material-ui/core";
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
                    <NavLink to={`/rally/${item.get('id')}`}>
                        <img
                            className={classes.cardMedia}
                            alt={item.get('title')}
                            src={item.getMediaSource( 0)}
                        />
                    </NavLink>
                    <CardContent>
                        <NavLink to={`/rally/${item.json.id}`}> <Typography gutterBottom variant="h4" component="h2">
                            {item.get('title')}
                        </Typography> </NavLink>
                        <Typography variant="body2" component="div">
                            <SanitizedHTML
                                allowedTags={Config.allowedTags}
                                allowedAttributes={Config.allowedAttributes}
                                html={item.get('body', 'summary') ? item.get('body', 'summary') : item.get('body', 'value')}
                            />
                        </Typography>
                        <NavLink to={`/rally/${item.json.id}`}>Read More</NavLink>
                    </CardContent>
                </CardContent>
            </Card>)
    }
}

export default withStyles(rallyStyles, {withTheme: true})(withSnackbar(RallyItem));
