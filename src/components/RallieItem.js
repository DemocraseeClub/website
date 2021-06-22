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
import Button from "@material-ui/core/Button";
import { NavLink } from "react-router-dom";
import Typography from "@material-ui/core/Typography";
import Config from "../Config";
import SanitizedHTML from "react-sanitized-html";
class RallieItem extends React.Component {

  render() {
        const { classes, item, loading } = this.props;

    return (
      <React.Fragment>
      {
        loading ?
          <Card className={classes.cardSkeleton}>
                  <CardActionArea>
                    <Skeleton variant="rect" width="100%" height={200} />
                    <CardContent>
                      <Skeleton width="40%" />
                      <Skeleton />
                      <Skeleton />
                      <Skeleton />
                    </CardContent>
                  </CardActionArea>
                  <CardActions style={{ justifyContent: "space-between" }}>
                    <Button size="small" color="primary">
                      View
                    </Button>
                    <Button size="small" color="primary">
                      Subscribe
                    </Button>
                  </CardActions>
          </Card> :
          <Card className={classes.card}>
                  <CardActionArea>
                    <NavLink to={`/rally/${item.id}`}>
                      <CardMedia
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://kaikucaffelatte.com/blog/wp-content/uploads/2020/03/shutterstock_510679489-scaled.jpg";
                        }}
                        className={classes.cardMedia}
                        component="img"
                        alt={item.title}
                        height="200"
                        style={{ objectFit: "contain" }}
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
                          html={item.description}
                        />
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                  <CardActions style={{ justifyContent: "space-between" }}>
                    <NavLink to={`/rally/${item.id}`}>
                      <Button
                        size="small"
                        color="primary"
                        style={{ minWidth: "auto" }}
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
                </Card>
      }
    </React.Fragment>)
  }
}

export default withStyles(rallyStyles, { withTheme: true })(
  withSnackbar(RallieItem)
);