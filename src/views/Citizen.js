import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import { rallyStyles } from "../Util/ThemeUtils";
import { withRouter } from "react-router";
import { withCmsHooks } from "./firebaseCMS/FirebaseCMS";
import { withSnackbar } from "notistack";
import { Link } from "react-router-dom";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import WebIcon from "@material-ui/icons/Web";
import Chip from "@material-ui/core/Chip";
import Card from "@material-ui/core/Chip";
import Button from "@material-ui/core/Button";
import CardContent from "@material-ui/core/Chip";
import CardMedia from "@material-ui/core/Chip";
import Skeleton from "@material-ui/lab/Skeleton";
import SanitizedHTML from "react-sanitized-html";
import Config from "../Config";
import Masonry from "react-masonry-css";
import SettingsSharpIcon from "@material-ui/icons/SettingsSharp";
import CardActionArea from "@material-ui/core/CardActionArea";
import { normalizeUser, normalizeResource, normalizeSubscription } from "../redux/entityDataReducer";
import { NavLink } from "react-router-dom";
import SettingsIcon from "@material-ui/icons/Settings";
import Box from "@material-ui/core/Box";

class Citizen extends React.Component {
  constructor(p) {
    super(p);
    this.state = {
      rTypes: [],
      selected: [],
      hasOfficeHours: false,
      loading: true,
      resources: [],
      subscriptions: [],
      citizen: {},
    };
  }

  componentDidMount() {
    this.fetchCitizenInfo();
  }

  async fetchCitizenInfo() {
    let userRef = window.fireDB
      .collection("users")
      .doc(this.props.match.params.uid);

    //get citizen
    let auxCitizen = await window.fireDB
      .collection("users")
      .doc(this.props.match.params.uid)
      .get();

    let citizen = await normalizeUser(auxCitizen, ["picture", "coverPhoto"]);

    //get citizen's resources
    let auxResources = await window.fireDB
      .collection("resources")
      .where("author", "==", userRef)
      .get();

    let promiseResources = [];
    auxResources.forEach((doc) =>
      promiseResources.push(normalizeResource(doc, ["image", "resource_type"]))
    );

    let resources = await Promise.all(promiseResources);

    //get citizen's subscriptions

    let auxSubscriptions = await window.fireDB
    .collection("subscriptions")
    .where("subscriber", "==", userRef)
    .get()

    let promiseSubscriptions = [];
    auxSubscriptions.forEach((doc) =>
       promiseSubscriptions.push(normalizeSubscription(doc, ["meeting", "rally"]))
    );

    let subscriptions = await Promise.all(promiseSubscriptions);

    this.setState({ citizen, resources, subscriptions, loading: false });
  }

  handleDelete(id) {

      console.log("delete item")

      window.fireDB.collection("subscriptions").doc(id).delete()
      .then(() => {
        this.props.enqueueSnackbar('the application has been deleted!');
        this.fetchCitizenInfo()
      }).catch((error) => {
          console.error("Error removing document: ", error);
      });

  }

  render() {
    const {
      citizen: { realName, displayName, website, bio, coverPhoto, picture },
      resources,
      loading,
    } = this.state;

    const { classes } = this.props;
    const preventDefault = (event) => event.preventDefault();
    const breakpoints = {
      default: 4,
      1100: 4,
      900: 3,
      600: 2,
      500: 1,
    };
    return (
      <Paper className={classes.root}>
        <Box>
          {loading ? (
            <Skeleton width="100%" style={{ height: "30vh" }} />
          ) : (
            <div
              style={{
                width: "100%",
                height: "30vh",
                backgroundImage: `url(${coverPhoto})`,
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                backgroundAttachment: "fixed",
                backgroundColor: "white",
                position: "relative",
              }}
            >
              <Avatar
                alt="Citizen pic"
                src={picture}
                className={classes.profilePicture}
              />
            </div>
          )}
          <Box className={this.props.classes.section}>
            {loading ? (
              <React.Fragment>
                <Skeleton />
                <Skeleton />
                <Chip
                  className={classes.profileChip}
                  icon={<WebIcon />}
                  label="User name"
                />
                <Skeleton />
                <Skeleton />
                <Skeleton />
              </React.Fragment>
            ) : (
              <React.Fragment>
                <NavLink to={`/citizen/${this.props.match.params.uid}/edit`}>
                  <SettingsIcon />
                </NavLink>

                <Typography variant="h1" className={classes.profileName}>
                  {realName ? realName : displayName}

                  {this.props.authController?.loggedUser?.uid ===
                    this.props.match.params.uid && (
                    <Button
                      style={{ float: "right" }}
                      component={Link}
                      to={`/citizen/${this.props.match.params.uid}/edit`}
                      color={"primary"}
                      variant={"contained"}
                    >
                      Edit Profile
                    </Button>
                  )}
                </Typography>
                {website && (
                  <Chip
                    className={classes.profileChip}
                    icon={<WebIcon />}
                    label={website}
                    onClick={preventDefault}
                  />
                )}
                {bio && (
                  <Typography variant="body1" className={classes.profileBio}>
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
                      html={bio}
                    />
                  </Typography>
                )}
              </React.Fragment>
            )}
          </Box>
          <Box className={this.props.classes.section}>
            <Chip
              icon={<SettingsSharpIcon />}
              label="Resources"
              onClick={preventDefault}
            />
            <Masonry
              breakpointCols={breakpoints}
              className="my-masonry-grid"
              columnClassName="my-masonry-grid_column"
            >
              {loading
                ? [1, 2, 3, 4, 5, 6].map((item, key) => (
                    <div key={"rskeleton" + key}>
                      <Card className={this.props.classes.cardSkeleton}>
                        <CardActionArea>
                          <Skeleton variant="rect" width="100%" height={200} />
                          <CardContent>
                            <Skeleton width="40%" />
                            <Skeleton />
                            <Skeleton />
                            <Skeleton />
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </div>
                  ))
                : resources.length > 0 &&
                  resources.map(
                    (
                      item,
                      key //TODO error loading resources with materialui card
                    ) => (
                      <div key={"resource" + key}>
                        <img src={item.image} alt="test" />
                        <p>{item.title}</p>
                        {console.log(item)}
                        <Card className={this.props.classes.card}>
                          <CardMedia
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/images/greenicons.png";
                            }}
                            className={this.props.classes.cardMedia}
                            component="img"
                            alt={item.title}
                            height="200"
                            style={{ objectFit: "contain" }}
                            src={item.image}
                          />
                          {/* http://localhost:3000/c/users/19WuksSnY9RFwboJsepf */}
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
                          </CardContent>
                        </Card>
                      </div>
                    )
                  )}
            </Masonry>
          </Box>
          <Box className={this.props.classes.section}>
                {
                  this.state.subscriptions && this.state.subscriptions.length > 0 &&
                  <>

                      <Chip
                        icon={<SettingsSharpIcon />}
                        label="Subscriptions"
                        onClick={preventDefault}
                      />
                     <div style={{width: "100%", display:"flex", flexWrap: "wrap"}}>
                        {

                            this.state.subscriptions.map((sub, i) => {
                              console.log(sub)
                              return (
                                <>
                                  <Box style={{display: "flex", flexDirection: "column", width: "max-content", margin:"20px"}}>
                                    <Chip
                                      key={i}
                                      label={<b style={{fontSize:"18px"}}>{`Rally: ${sub.rally.title}`}</b>}
                                      onDelete={(e) => this.handleDelete(sub.id) }
                                      color="primary"
                                    />
                                    <Chip
                                      key={i}
                                      label={`Meeting: ${sub.meeting.title}`}
                                      color="secondary"
                                    />
                                    <Chip
                                      label={`Status: ${sub.status}`}
                                    />
                                  </Box>
                                </>
                              )

                            })

                        }
                     </div>

                  </>
                }
        </Box>
        </Box>
      </Paper>
    );
  }
}

export default withStyles(rallyStyles, { withTheme: true })(
  withSnackbar(withCmsHooks(withRouter(Citizen)))
);
