import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { withSnackbar } from "notistack";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import Box from "@material-ui/core/Box";
import Avatar from "@material-ui/core/Avatar";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import SearchIcon from "@material-ui/icons/Search";
import InputAdornment from "@material-ui/core/InputAdornment";
import { rallyStyles } from "../Util/ThemeUtils";
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
      loading: true,
      resources: [],
    };
  }

  componentDidMount() {
    window.fireDB
      .collection("resource_types")
      .get()
      .then((types) => {
        let rTypes = [];
        types.forEach((doc) => rTypes.push(doc.data().type));
        this.setState({ rTypes: rTypes });
      })
      .catch((err) => console.log(err));
    window.fireDB
      .collection("resources")
      .get()
      .then((resourcesData) => {
        let resourcesDataParsed = [];
        resourcesData.forEach((doc) => {
          let resource = { key: doc.id, ...doc.data() };

          resourcesDataParsed.push(resource);
        });
        return resourcesDataParsed;
      })
      .then((res) => {
        (async function () {
          for (let i = 0; i < res.length; i++) {
            if (res[i].author) {
              let user = await res[i].author.get();
              res[i].author = { ...user.data() };
            }
          }
          return res;
        })().then((t) => {
          this.setState({ resources: t, loading: false });
        });
      })
      .catch((err) => console.log(err));
  }

  redeem(email) {
    this.props.enqueueSnackbar("Email: " + email);
    window.logUse.logEvent("resource-redeem", { email: email });
  }

  render() {
    const { loading } = this.state;

    const { classes } = this.props;

    const currencies = [
      {
        value: "USD",
        label: "$",
      },
      {
        e: "EUR",
        label: "€",
      },
      {
        value: "BTC",
        label: "฿",
      },
      {
        value: "JPY",
        label: "¥",
      },
    ];

    const items = [
      {
        img: "/images/coin.png",
        alt: "citizen-coin",
        text: "Earn 2 - 2000 Citizen Coins",
      },
      {
        img: "/images/hero.jpg",
        alt: "hero-badge",
        text: "Explorer or Hero Badge",
      },
      {
        img: "/images/lighbulb.png",
        alt: "Time-knowledge",
        text: "Time and Knowledge",
      },
    ];

    return (
      <Box>
        <Grid container className={classes.sectionSecondary}>
          <Grid item xs={8}>
            <Typography variant={"h5"} className={classes.sectionTitle}>
              <b>Request and Receive Help From Your Community</b>
            </Typography>
            <Typography variant={"h6"} className={classes.sectionSubtitle}>
              {" "}
              All action with plans will receive a percentage of the current
              city pot of <b>2000 Citize Coins</b>
            </Typography>
            <Grid
              container
              spacing={3}
              className={classes.sectionItemsContainer}
            >
              {items.map(({ img, alt, text }) => (
                <Grid item>
                  <Box display="flex" alignItems="center">
                    <Avatar
                      src={img}
                      className={classes.sectionItemImg}
                      alt={alt}
                    />
                    <Typography
                      variant={"body2"}
                      className={classes.sectionItemText}
                    >
                      <b>Earn 2 - 2000 Citizen Coins</b>
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
            <Button variant="outlined" className={classes.sectionLeftButton}>
              Request Help
            </Button>
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
              />
            </Box>
          </Grid>
        </Grid>
        <Box className={classes.section}>
          <Grid container>
            <Grid item xs={5}>
              <Card style={{ background: "none", boxShadow: "none" }}>
                <Typography variant={"h4"}>Local Resources</Typography>
              </Card>
            </Grid>
            <Grid item xs={7}>
              <Grid container spacing={1} justify="flex-end">
                <Grid item>
                  <TextField
                    id="standard-multiline-flexible"
                    label="Search"
                    size="medium"
                    variant="outlined"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item>
                  <TextField
                    className={classes.sectionSelect}
                    id="standard-select-currency"
                    select
                    label="Filter"
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
                <Grid item>
                  <TextField
                    className={classes.sectionSelect}
                    id="standard-select-currency"
                    select
                    label="Sort by"
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
              </Grid>
            </Grid>
          </Grid>
          <Grid
            container
            spacing={10}
            justify="center"
            alignItems="stretch"
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
                          variant={"body2"}
                          className={classes.cardBadge}
                        >
                          {item.title}
                        </Typography>
                        <Typography variant={"body1"}>
                          <b
                            dangerouslySetInnerHTML={{
                              __html: item.descriptionHTML,
                            }}
                          />
                        </Typography>
                        <Typography
                          variant={"body1"}
                          className={classes.cardSubtitle}
                        >
                          with {item.author.realName}
                        </Typography>
                        <Typography
                          variant={"body1"}
                          className={classes.cardLink}
                        >
                          Schedule Meeting
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Skeleton width="40%" />
                        <Skeleton />
                        <Skeleton />
                        <Skeleton />
                      </>
                    )}

                    {/* {
                                            item.links.map(link => <Typography variant={'body1'} className={classes.cardLink} key={link}>{link}</Typography>)
                                        } */}
                  </Card>
                </Grid>
              )
            )}
          </Grid>
        </Box>
        <Box className={classes.section}>
          <Grid container>
            <Grid item xs={5}>
              <Card style={{ background: "none", boxShadow: "none" }}>
                <Typography variant={"h4"}>Request for Help</Typography>
              </Card>
            </Grid>
            <Grid item xs={7}>
              <Grid container spacing={1} justify="flex-end">
                <Grid item>
                  <TextField
                    id="standard-multiline-flexible"
                    label="Search"
                    size="medium"
                    variant="outlined"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item>
                  <TextField
                    className={classes.sectionSelect}
                    id="standard-select-currency"
                    select
                    label="Filter"
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
                <Grid item>
                  <TextField
                    className={classes.sectionSelect}
                    id="standard-select-currency"
                    select
                    label="Sort by"
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
              </Grid>
            </Grid>
          </Grid>
          <Grid
            container
            justify="space-between"
            alignItems="center"
            className={classes.sectionFooter}
          >
            <Grid item>
              <Box display="flex" alignItems="center">
                <Avatar
                  src="/images/indy.png"
                  alt="card-img"
                  className={classes.cardImg}
                />
                <Typography variant={"body1"} className={classes.sectionLink}>
                  Need Volunters for Upcoming Rally on Nov 16th
                </Typography>
              </Box>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                color="primary"
                className={classes.outlinedButton}
              >
                Offer Help
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>
    );
  }
}

export default withStyles(rallyStyles)(withSnackbar(Resources));
