import React from "react";
import {withStyles} from "@material-ui/core/styles";
import {rallyStyles} from "../Util/ThemeUtils";
import {withSnackbar} from "notistack";
import {Card, CardActions, CardContent} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import SanitizedHTML from "react-sanitized-html";
import Grid from "@material-ui/core/Grid";
import {NavLink} from "react-router-dom";
import OfficeHours from "./OfficeHours";
import Config from "../Config";

class ResourceItem extends React.Component {

    redeem() {
        window.logUse.logEvent("resource-redeem", {id:this.props.item.id, title:this.props.item.title});
    }

    render() {

        const {classes, item} = this.props;

        return (<Card className={this.props.classes.card} onClick={() => this.redeem()}>
            <img
                className={classes.cardMedia}
                alt={item.title}
                src={item.image}
            />
            <CardContent>
                <Typography
                    variant={"h2"}
                    style={{
                        color: this.props.theme.palette.primary.light,
                    }}
                >
                    {item.title}
                </Typography>
                <Typography variant={"body1"}>
                    <SanitizedHTML
                        allowedIframeDomains={["linkedin.com"]}
                        allowedIframeHostnames={["www.linkedin.com"]}
                        allowIframeRelativeUrls={false}
                        allowedSchemes={["data", "https"]}
                        allowedTags={Config.richTags}
                        allowedAttributes={Config.richAttributes}
                        exclusiveFilter={(frame) => {
                            if (frame.tag === "iframe") {
                                if (
                                    frame.attribs.src.indexOf(
                                        "https://linkedin.com"
                                    ) !== 0
                                ) {
                                    return true;
                                }
                            }
                            return false;
                        }}
                        html={item.descriptionHTML}
                    />
                </Typography>
                <Typography
                    variant={"body2"}
                    className={classes.cardSubtitle}
                >
                    <em> with </em>
                    <NavLink to={'/citizen/' + item.author.id}>{item.author.displayName}</NavLink>
                </Typography>
            </CardContent>
            <CardActions>
                <Grid container direction={"column"}>
                    {item.office_hours && (
                        <OfficeHours
                            office_hours={item.office_hours}
                            author={item.author}
                        />
                    )}
                </Grid>
            </CardActions>
        </Card>)
    }
}

export default withStyles(rallyStyles, {withTheme: true})(withSnackbar(ResourceItem));
