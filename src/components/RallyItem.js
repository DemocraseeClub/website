import React from "react";
import {Card, CardContent} from "@material-ui/core";
import {NavLink} from "react-router-dom";
import Typography from "@material-ui/core/Typography";
import Config from "../Config";
import SanitizedHTML from "react-sanitized-html";
import {withSnackbar} from "notistack";
import {withStyles} from "@material-ui/core/styles";
import {rallyStyles} from "../Util/ThemeUtils";
import MediaItem from "./MediaItem";

class RallyItem extends React.Component {

    render() {
        const {classes, item} = this.props;

        let cover = item.getMediaObj(0);

        return (
            <Card className={classes.card}>
                <CardContent>
                    {cover &&
                    <NavLink to={`/rally/${item.getAttr('id')}`}>
                        <MediaItem media={cover}/>
                    </NavLink>
                    }
                    <CardContent>
                        <NavLink to={`/rally/${item.getAttr('id')}`}> <Typography gutterBottom variant="h4"
                                                                                  component="h2">
                            {item.getAttr('title')}
                        </Typography> </NavLink>

                        {item.get('body', 'summary') ?
                            <Typography variant="body2" component="div"><p>{item.get('body', 'summary')}</p>
                            </Typography>
                            :
                            (item.get('body', 'processed') ?
                                <Typography variant="body2" component="div"><SanitizedHTML
                                    allowedTags={Config.allowedTags}
                                    allowedAttributes={Config.allowedAttributes}
                                    html={item.get('body', 'processed')}/></Typography>
                                : '')
                        }

                        <NavLink to={`/rally/${item.getAttr('id')}`}>Read More</NavLink>
                    </CardContent>
                </CardContent>
            </Card>)
    }
}

export default withStyles(rallyStyles, {withTheme: true})(withSnackbar(RallyItem));
