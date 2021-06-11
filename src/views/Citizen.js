import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import { rallyStyles } from "../Util/ThemeUtils";
import { withRouter } from "react-router";
import { withCmsHooks } from "./firebaseCMS/FirebaseCMS";
import { withSnackbar } from "notistack";
import Avatar from "@material-ui/core/Avatar";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import WebIcon from "@material-ui/icons/Web";
import Chip from "@material-ui/core/Chip";
import Grid from "@material-ui/core/Grid";
import { Card, CardContent, CardMedia } from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";
import SanitizedHTML from "react-sanitized-html";
import Config from "../Config";
import Masonry from "react-masonry-css";
import SettingsSharpIcon from "@material-ui/icons/SettingsSharp";
import CardActionArea from "@material-ui/core/CardActionArea";

class Citizen extends React.Component {
  constructor(p) {
    super(p);
    this.state = {
      rTypes: [],
      selected: [],
      hasOfficeHours: false,
      loading: true,
      resources: [],
      citizen: {},
    };
  }

  componentDidMount() {
    this.fetchCitizenInfo();
  }

  async fetchCitizenInfo() {
    let citizenData = await fetch(
      process.env.REACT_APP_FUNCTIONS_URL +
        "/citizen/" +
        this.props.match.params.uid
    ).then(async (data) => {
      let parsedData = await data.json();
      if (parsedData?.citizen?.picture) {
        try {
          let path = window.fbStorage.ref(parsedData.citizen.picture);
          const url = await path.getDownloadURL();
          parsedData.citizen.picture = url;
        } catch (e) {
          console.log(e);
        }
      }

      if (parsedData?.citizen?.coverPhoto) {
        try {
          let path = window.fbStorage.ref(parsedData.citizen.coverPhoto);
          const url = await path.getDownloadURL();
          parsedData.citizen.coverPhoto = url;
        } catch (e) {
          console.log(e);
        }
      }

      if (parsedData?.resources) {
       
        for(let i=0; i< parsedData.resources.length; i++) {

            let item = parsedData.resources[i]

            if (item?.image) {
                  try {
                    let path = window.fbStorage.ref(item.image);
                    const url = await path.getDownloadURL();
                    item.image = url;
                  } catch (e) {
                    console.log(e);
                  }
            }
        }

      }
      return parsedData;
    });
    let { citizen, resources } = citizenData;

    this.setState({ citizen, resources, loading: false });
  }

  render() {
    const {
      citizen: { realName, website, bio, coverPhoto, picture },
      resources,
      loading,
    } = this.state;
    const { classes } = this.props;
    const preventDefault = (event) => event.preventDefault();
    const breakpoints = {
      default: 2,
      600: 1,
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

          <Grid container className={this.props.classes.section}>
            <Grid item md={4} sm={12}>
              {loading ? (
                <>
                  <Skeleton />
                  <Skeleton />
                  <Chip
                    className={classes.profileChip}
                    icon={<WebIcon />}
                    label="https://something.com"
                  />
                  <Skeleton />
                  <Skeleton />
                  <Skeleton />
                </>
              ) : (
                <>
                  <Typography variant="h1" className={classes.profileName}>
                    {realName}
                  </Typography>

                  <Chip
                    className={classes.profileChip}
                    icon={<WebIcon />}
                    label={website}
                    onClick={preventDefault}
                  />
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
                </>
              )}
            </Grid>
            <Grid item md={8} sm={12} xs={12}>
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
                {false
                  ? [1, 2, 3, 4, 5, 6].map((item, key) => (
                      <div key={"rskeleton" + key}>
                        <Card className={this.props.classes.cardSkeleton}>
                          <CardActionArea>
                            <Skeleton
                              variant="rect"
                              width="100%"
                              height={200}
                            />
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
                  : resources.map((item, key) => (
                      <div key={"resource" + key}>
                        {console.log(resources)}
                        <Card className={this.props.classes.card}>
                          <CardMedia
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://kaikucaffelatte.com/blog/wp-content/uploads/2020/03/shutterstock_510679489-scaled.jpg";
                            }}
                            className={this.props.classes.cardMedia}
                            component="img"
                            alt={item.title}
                            height="200"
                            style={{ objectFit: "contain" }}
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
                          </CardContent>
                        </Card>
                      </div>
                    ))}
              </Masonry>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    );
  }
}

export default withStyles(rallyStyles, { withTheme: true })(
  withSnackbar(withCmsHooks(withRouter(Citizen)))
);
