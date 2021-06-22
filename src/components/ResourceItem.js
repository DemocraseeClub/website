import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { rallyStyles } from "../Util/ThemeUtils";
import { withSnackbar } from "notistack";
import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
} from "@material-ui/core";
import CardActionArea from "@material-ui/core/CardActionArea";
import Skeleton from "@material-ui/lab/Skeleton";
import Typography from "@material-ui/core/Typography";
import SanitizedHTML from "react-sanitized-html";
import Grid from "@material-ui/core/Grid";
import { NavLink } from "react-router-dom";
import OfficeHours from "./OfficeHours";
import Config from "../Config";

class ResourceItem extends React.Component {

  render() {

    const { classes, item, loading } = this.props;

    return (<React.Fragment>
      {
        loading ? <Card className={this.props.classes.cardSkeleton}>
                    <CardActionArea>
                      <Skeleton variant="rect" width="100%" height={200} />
                      <CardContent>
                        <Skeleton width="40%" />
                        <Skeleton />
                        <Skeleton />
                        <Skeleton />
                      </CardContent>
                    </CardActionArea>
                  </Card> :
      <Card className={this.props.classes.card}>
                    <CardMedia
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://kaikucaffelatte.com/blog/wp-content/uploads/2020/03/shutterstock_510679489-scaled.jpg";
                      }}
                      className={this.props.classes.cardMedia}
                      component="img"
                      alt={item.title}
                      height="200"
                      style={{ objectFit: "contain" }}
                      image={item.image}
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
                        <NavLink to={'/citizen/'+item.author.id}>{item.author.displayName}</NavLink>
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
                  </Card>
      }
    </React.Fragment>)
  }
}

export default withStyles(rallyStyles, { withTheme: true })(
  withSnackbar(ResourceItem)
);