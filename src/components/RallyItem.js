import React from "react";
import {withStyles} from "@material-ui/core/styles";
import {rallyStyles} from "../Util/ThemeUtils";
import {withSnackbar} from "notistack";
import {Card, CardContent} from "@material-ui/core";
import {NavLink} from "react-router-dom";
import Typography from "@material-ui/core/Typography";
import Config from "../Config";
import SanitizedHTML from "react-sanitized-html";

class RallyItem extends React.Component {

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
                        <NavLink to={`/rally/${item.get('id')}`}> <Typography gutterBottom variant="h4" component="h2">
                            {item.get('title')}
                        </Typography> </NavLink>
                        <Typography variant="body2" component="div">
                            <SanitizedHTML
                                allowedTags={Config.allowedTags}
                                allowedAttributes={Config.allowedAttributes}
                                html={item.get('body', 'summary') ? item.get('body', 'summary') : item.get('body', 'f')}
                            />
                        </Typography>
                        <NavLink to={`/rally/${item.get('id')}`}>Read More</NavLink>
                    </CardContent>
                </CardContent>
            </Card>)
    }
}

export default withStyles(rallyStyles, {withTheme: true})(withSnackbar(RallyItem));
