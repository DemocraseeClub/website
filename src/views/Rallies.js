import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
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
import { useAuthContext, useSideEntityController } from "@camberi/firecms";
import { rallySchema } from "./firebaseCMS/collections/rally";
import { rallyStyles } from "../Util/ThemeUtils";
import Skeleton from "@material-ui/lab/Skeleton";

function withCmsHooks(Component) {
  return function WrappedComponent(props) {
    const sideEntityController = useSideEntityController();
    const authContext = useAuthContext();
    return (
      <Component
        {...props}
        sideEntityController={sideEntityController}
        authContext={authContext}
      />
    );
  };
}

class Rallies extends React.Component {
  constructor(p) {
    super(p);
    this.state = {
      error: false,
      loading: true,
      rallies: [],
    };
  }

  componentDidMount() {
    window.fireDB
      .collection("rallies")
      .get()
      .then((ralliesData) => {
        let ralliesDataParsed = [];
        ralliesData.forEach((doc) => {
          let resource = { key: doc.id, ...doc.data() };

          ralliesDataParsed.push(resource);
        });
        return ralliesDataParsed;
      })
      .then((rallies) => {
        this.setState({ rallies: rallies, loading: false });
      })
      .catch((err) => console.log(err));
  }

  trackSubscribe(id) {
    this.props.enqueueSnackbar(
      "We track clicks on this to prioritize development and schedule. Please only click once for any rallies you are interested in"
    );
    window.logUse.logEvent("rally-subscribe", { id: id });
  }

  showRallyForm() {
    console.log(
      this.props.authContext,
      this.props.sideEntityController.sidePanels
    );
    this.props.sideEntityController.open({
      // entityId: false,
      collectionPath: "rallies",
      // , schema: rallySchema // TODO: customize visible fields by user
    });
  }

  render() {
    const { loading } = this.state;

    return (
      <Box p={4} className={this.props.classes.section}>
        <Box style={{ textAlign: "right" }}>
          <NavLink
            style={{ textDecoration: "none", marginRight: 5 }}
            to={"/rally/templates"}
          >
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
        </Box>
        <Card style={{ background: "none", boxShadow: "none" }}>
          <Typography variant={"h3"}>Rallying</Typography>
        </Card>
        <Grid
          container
          justify={"space-around"}
          spacing={4}
          alignItems="stretch"
        >
          {(loading ? Array.from(new Array(6)) : this.state.rallies).map(
            (item, key) => (
              <Grid key={key} item xs={12} sm={6} md={4}>
                <Card style={{ height: "100%" }}>
                  {console.log(item)}
                  <CardActionArea>
                    {item ? (
                      <NavLink to={"/rally/building-democrasee"}>
                        <CardMedia
                          component="img"
                          alt="Democrasee Logo"
                          height="200"
                          style={{ objectFit: "contain" }}
                          image={item.picture}
                          title="Democrasee Logo"
                        />
                      </NavLink>
                    ) : (
                      <Skeleton variant="rect" width="100%" height={200} />
                    )}
                    <CardContent>
                      {item ? (
                        <>
                          <Typography gutterBottom variant="h5" component="h2">
                            {item.title}
                          </Typography>
                          <Typography
                            dangerouslySetInnerHTML={{
                              __html: item.description,
                            }}
                            variant="body2"
                            color="textSecondary"
                            component="p"
                          />
                        </>
                      ) : (
                        <>
                          <Skeleton width="40%" />
                          <Skeleton />
                          <Skeleton />
                          <Skeleton />
                        </>
                      )}
                    </CardContent>
                  </CardActionArea>
                  <CardActions style={{ justifyContent: "space-between" }}>
                    <NavLink to={"/rally/building-democrasee"}>
                      <Button size="small" color="primary">
                        View
                      </Button>
                    </NavLink>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => this.trackSubscribe("building-democrasee")}
                    >
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

export default withStyles(rallyStyles)(withSnackbar(withCmsHooks(Rallies)));
