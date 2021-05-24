import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { withSnackbar } from "notistack";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import Box from "@material-ui/core/Box";
import Avatar from "@material-ui/core/Avatar";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { rallyStyles } from "../Util/ThemeUtils";
import Config from "../Config";
import SanitizedHTML from "react-sanitized-html";
import Skeleton from "@material-ui/lab/Skeleton";

class Resources extends React.Component {
  constructor(p) {
    super(p);
    this.state = {
      rTypes: [],
      city: "",
      county: "",
      state: "",
      error: false,
      rType: "",
      loading: true,
      resources: [],
    };
  }

  componentDidMount() {
    window.fireDB
      .collection("resource_types")
      .get()
      .then((types) => {
        var rTypes = types.docs.map((doc) => doc.data());
        this.setState({ rTypes: rTypes });
      })
      .catch((err) => console.log(err));

    fetch(process.env.REACT_APP_FUNCTIONS_URL + "/resources")
      .then((response) => response.json())
      .then(async (data) => {
        for (let i = 0; i < data.length; i++) {
          try {
            if (data[i].image) {
              let path = window.storage.ref(data[i].image);
              const url = await path.getDownloadURL();
              data[i].image = url;
            }
          } catch (e) {}
        }

        return data;
      })
      .then((resources) => {
        this.setState({ resources: resources, loading: false });
      })
      .catch((err) => console.log(err));
  }

  redeem(email) {
    this.props.enqueueSnackbar("Email: " + email);
    window.logUse.logEvent("resource-redeem", { email: email });
  }

  handleChange(rType) {
    this.setState({ rType, loading: true });
    fetch(process.env.REACT_APP_FUNCTIONS_URL + `/resources/${rType}`)
      .then((response) => response.json())
      .then(async (data) => {
        for (let i = 0; i < data.length; i++) {
          try {
            if (data[i].image) {
              let path = window.storage.ref(data[i].image);
              const url = await path.getDownloadURL();
              data[i].image = url;
            }
          } catch (e) {}
        }

        return data;
      })
      .then((resources) => {
        this.setState({ resources: resources, loading: false });
      })
      .catch((err) => console.log(err));
  }

  render() {
    const { classes } = this.props;
    const { loading } = this.state;
    return (
      <Box>
        <Grid container className={classes.sectionSecondary}>
          <Grid item xs={8}>
            <Typography variant={"h5"} className={classes.sectionTitle}>
              <b>Request and Receive Help From Your Community</b>
            </Typography>
            <Typography variant={"h6"} className={classes.sectionSubtitle}>
              Pay with cash or CitizenCoin earned through contributions to this
              community platform
            </Typography>
            {/* <Grid container spacing={3} className={classes.sectionItemsContainer}>
                            {
                                items.map(({img, alt, text}) => <Grid item key={alt}>
                                    <Box display="flex" alignItems="center">
                                        <Avatar src={img} className={classes.sectionItemImg} alt={alt}/>
                                        <Typography variant={'body2'} className={classes.sectionItemText}><b>Earn 2 -
                                            2000 Citizen Coins</b></Typography>
                                    </Box>
                                </Grid>)
                            }
                        </Grid>  <Button variant="outlined" className={classes.sectionLeftButton}>Request Help</Button> */}

            <Button className={classes.sectionRightButton}>
              Offer Your Expertise
            </Button>
          </Grid>
          <Grid item xs={4}>
            <Box display="flex" alignItems="center" justifyContent="center">
              <img
                src="/images/lighbulb.png"
                alt="blueSection-hero"
                className={classes.sectionHero}
                style={{ height: 120 }}
              />
            </Box>
          </Grid>
        </Grid>
        <Box className={classes.section}>
          <Grid container alignItems={"center"} justify={"space-between"}>
            <Grid item>
              {/* <Grid item>
                                <TextField
                                    id="standard-multiline-flexible"
                                    label="Search"
                                    size="medium"
                                    variant="outlined"
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">
                                            <SearchIcon/>
                                        </InputAdornment>
                                    }}
                                />
                            </Grid>
                            <Grid item>
                                <TextField
                                    className={classes.sectionSelect}
                                    id="standard-select-currency"
                                    select
                                    label="Currency"
                                    size="medium" 
                                    variant="outlined"
                                >
                                    {currencies.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            */}
              <Grid item>
                <Select
                  className={classes.sectionSelect}
                  id="resource_type_filter"
                  select
                  displayEmpty={true}
                  value={this.state.rType}
                  onChange={(e) => this.handleChange(e.target.value)}
                  label="Resource Types"
                  variant="outlined"
                >
                  <MenuItem value={""}>All Resource Types</MenuItem>
                  {this.state.rTypes.map((option) => (
                    <MenuItem key={option.type} value={option.type}>
                      {option.type}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
            </Grid>
          </Grid>
          <Grid
            container
            spacing={10}
            justify="center"
            className={classes.cardsContainer}
          >
            {(loading ? Array.from(new Array(6)) : this.state.resources).map(
              (item, key) => (
                <Grid item key={key}>
                  <Card className={classes.card}>
                    <Grid
                      container
                      justify="space-between"
                      alignItems="center"
                      className={classes.cardHeader}
                    >
                      <Grid item>
                        {item ? (
                          <Avatar
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "images/citizencoin.png";
                            }}
                            src={item.image}
                            alt="card-img"
                            className={classes.cardImg}
                          />
                        ) : (
                          <Skeleton variant="circle" width={80} height={80} />
                        )}
                      </Grid>
                      <Grid item>
                        <Button className={classes.cardButton}>View</Button>
                      </Grid>
                    </Grid>
                    {item ? (
                      <>
                        <Typography
                          variant={"h2"}
                          className={classes.cardBadge}
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
                          with <em>{item.author.realName}</em>
                        </Typography>
                        {/* {
                                            item.links.map(link => <Typography variant={'body1'} className={classes.cardLink} key={link}>{link}</Typography>)
                                        } */}
                      </>
                    ) : (
                      <>
                        <Skeleton width="40%" />
                        <Skeleton />
                        <Skeleton />
                        <Skeleton />
                      </>
                    )}
                  </Card>
                </Grid>
              )
            )}
          </Grid>
        </Box>
      </Box>
    );
  }
}

export default withStyles(rallyStyles)(withSnackbar(Resources));
