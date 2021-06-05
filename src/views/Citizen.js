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
import { Card, CardActions, CardContent, CardMedia } from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";
import SanitizedHTML from "react-sanitized-html";
import Config from "../Config";
import OfficeHours from "../components/OfficeHours";
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
    };
  }

  componentDidMount() {
    this.fetchResources();
  }

  async fetchResources() {
    
    //ejemplo de uso del endpoint
    let citizenData = await fetch(process.env.REACT_APP_FUNCTIONS_URL + "/citizen/" + this.props.match.params.uid)
    let {citizen, resources} = await citizenData.json()
    console.log(citizen)


    let resourcesRef = await window.fireDB
      .collection("users")
      .doc(this.props.match.params.uid);

    let doc = await resourcesRef.get();

    if (doc.exists) {
      console.log(doc, "AAAAAAAA wao");
    }
  }

  async handleChange(rTypes) {
    this.setState({ selected: rTypes, loading: true });

    let collection = window.fireDB.collection("resources");
    if (rTypes.length > 0) {
      // TODO: fix filter per: https://stackoverflow.com/a/53141199/624160. || https://youtu.be/Elg2zDVIcLo?t=276
      let filters = await Promise.all(
        rTypes.map((o) => {
          return window.fireDB.collection("resource_type").doc(o.id);
        })
      );
      console.log("FILTERING RESOURCE TYPES: ", filters);
      collection = collection.where("resource_type", "in", filters);
    }

    if (this.state.hasOfficeHours === true) {
      collection = collection.where("office_hours", "!=", false);
    }

    let snapshots = await collection.limit(25).get();
    const resources = await Promise.all(
      snapshots.docs.map(async (doc) => {
        let obj = {
          id: doc.id,
          ...doc.data(),
        };
        if (obj?.author) {
          const author = await obj.author.get();
          obj.author = { id: author.id, ...author.data() };
        }

        if (obj?.resource_type) {
          const resource_type = await obj.resource_type.get();
          obj.resource_type = { id: resource_type.id, ...resource_type.data() };
        }

        /* if (obj?.office_hours) {
              if (obj.office_hours.start_date) obj.office_hours.start_date = doc.office_hours.start_date.toDate();
              if (obj.office_hours.end_date) obj.office_hours.end_date = doc.office_hours.end_date.toDate();
            } */

        if (obj.image) {
          try {
            let path = window.fbStorage.ref(obj.image);
            const url = await path.getDownloadURL();
            obj.image = url;
          } catch (e) {
            console.log(e);
          }
        }

        return obj;
      })
    );
    console.log(resources);
    this.setState({ resources: resources, loading: false });
  }
  render() {
    const { classes } = this.props;
    const preventDefault = (event) => event.preventDefault();
    const breakpoints = {
      default: 2,
      1100: 1,
    };
    return (
      <Paper className={classes.root}>
        <Box>
          <div
            style={{
              width: "100%",
              height: "30vh",
              backgroundImage: `url(/images/Indy-Rishi-Singh-playing-flute.jpg)`,
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
              src="/images/indy.png"
              className={classes.profilePicture}
            />
          </div>
          <Grid container className={this.props.classes.section}>
            <Grid item xs={4}>
              <Typography variant="h1" className={classes.profileName}>
                Elpo Larni
              </Typography>
              <Typography
                variant="overline"
                className={classes.profileProfession}
              >
                Technical Wet Meat
              </Typography>

              <Chip
                className={classes.profileChip}
                icon={<WebIcon />}
                label="https://elpito.com"
                onClick={preventDefault}
              />
              <Typography variant="body1" className={classes.profileBio}>
                Contrary to popular belief, Lorem Ipsum is not simply random
                text. It has roots in a piece of classical Latin literature from
                45 BC, making it over 2000 years old. Richard McClintock, a
                Latin professor at Hampden-Sydney College in Virginia, looked up
                one of the more obscure Latin words, consectetur, from a Lorem
                Ipsum passage, and going through the cites of the word in
                classical literature, discovered the undoubtable source. Lorem
                Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus
                Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero,
                written in 45 BC. This book is a treatise on the theory of
                ethics, very popular during the Renaissance. The first line of
                Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line
                in section 1.10.32. The standard chunk of Lorem Ipsum used since
                the 1500s is reproduced below for those interested. Sections
                1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by
                Cicero are also reproduced in their exact original form,
                accompanied by English versions from the 1914 translation by H.
                Rackham.
              </Typography>
            </Grid>
            <Grid item xs={8}>
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
                {this.state.loading
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
                  : this.state.resources.map((item, key) => (
                      <div key={"resource" + key}>
                        <Card className={this.props.classes.card}>
                          <CardMedia
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "images/citizencoin.png";
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
                              {" "}
                              with{" "}
                              <em>
                                {item.author ? item.author.displayName : ""}
                              </em>
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
