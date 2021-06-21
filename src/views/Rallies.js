import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { NavLink } from "react-router-dom";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Button from "@material-ui/core/Button";
import { withSnackbar } from "notistack";
import { rallyStyles } from "../Util/ThemeUtils";
import Skeleton from "@material-ui/lab/Skeleton";
import Config from "../Config";
import SanitizedHTML from "react-sanitized-html";
import { withRouter } from "react-router";
import { withCmsHooks } from "./firebaseCMS/FirebaseCMS";
import { normalizeRally } from "../redux/entityDataReducer";
import Masonry from "react-masonry-css";

class Rallies extends React.Component {
  constructor(p) {
    super(p);
    this.state = { error: false, loading: true, rallies: [] };
  }

  componentDidMount() {
    this.handleChange();
  }

  async handleChange() {
    try {
      let snapshots = await window.fireDB.collection("rallies").limit(25).get();
      const rallies = await Promise.all(
        snapshots.docs.map((doc, i) => normalizeRally(doc, ["picture", "research"]))
      );
      this.setState({ loading: false, rallies: rallies, error: false });
    } catch (error) {
      this.setState({ loading: false, error: error.message });
    }
  }

  trackSubscribe(id) {
    this.props.enqueueSnackbar(
      "We track clicks on this to prioritize development and schedule. Please only click once for any rallies you are interested in"
    );
    window.logUse.logEvent("rally-subscribe", { id: id });
  }

  showRallyForm() {
    if (this.props.authController && this.props.authController.loggedUser) {
      console.log(
        this.props.authContext,
        this.props.sideEntityController.sidePanels
      );
      this.props.sideEntityController.open({ collectionPath: "/rallies" });
    } else {
      this.props.history.push("/login");
    }
  }

  render() {
    const { loading } = this.state;
    const { classes } = this.props;

    const breakpoints = {
      default: 3,
      1100: 2,
      700: 1,
    };
    return (
      <React.Fragment>
        <Grid
          container
          item
          className={classes.sectionSecondary}
          align={"center"}
          justify={"space-between"}
        >
          <Grid item>
            <Typography variant={"h3"}>Rallying</Typography>
          </Grid>
          <Grid item>
            <NavLink
              to={"/rally/templates"}
              style={{ textDecoration: "none", marginRight: 5 }}
            >
              <Button variant={"contained"} color={"secondary"}>
                Rally Templates
              </Button>
            </NavLink>

            <Button
              variant={"contained"}
              className={classes.redBtn}
              onClick={() => this.showRallyForm()}
            >
              Start a Rally
            </Button>
          </Grid>
        </Grid>

        <Masonry
          breakpointCols={breakpoints}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {this.state.error !== false ? (
            <Typography variant={"h4"}>{this.state.error}</Typography>
          ) : loading === true ? (
            [1, 2, 3, 4, 5, 6].map((num, key) => (
              <div key={"rskeleton" + key}>
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
                </Card>
              </div>
            ))
          ) : (
            this.state.rallies.map((item, key) => (
              <div key={"rally" + key}>
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
              </div>
            ))
          )}
        </Masonry>
      </React.Fragment>
    );
  }
}

export default withStyles(rallyStyles, { withTheme: true })(
  withSnackbar(withCmsHooks(withRouter(Rallies)))
);
