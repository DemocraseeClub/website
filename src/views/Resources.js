import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { withSnackbar } from "notistack";
import { NavLink } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Checkbox,
  FormControlLabel,
} from "@material-ui/core";
import Box from "@material-ui/core/Box";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { rallyStyles } from "../Util/ThemeUtils";
import Config from "../Config";
import SanitizedHTML from "react-sanitized-html";
import Skeleton from "@material-ui/lab/Skeleton";
import OfficeHours from "../components/OfficeHours";
import Masonry from "react-masonry-css";
import CardActionArea from "@material-ui/core/CardActionArea";
import {normalizeResource} from "../redux/entityDataReducer"
import ResourceItem from "../components/ResourceItem"
class Resources extends React.Component {
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
    window.fireDB
      .collection("resource_types")
      .get()
      .then((types) => {
        var rTypes = types.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        this.setState({ rTypes: rTypes });
      })
      .catch((err) => console.log(err));

    this.handleChange([]);
  }

  redeem(email) {
    this.props.enqueueSnackbar("Email: " + email);
    window.logUse.logEvent("resource-redeem", { email: email });
  }

  async handleChange(rTypes) {
    this.setState({ selected: rTypes, loading: true });

    let collection = window.fireDB.collection("resources");
    if (rTypes.length > 0) {
      // TODO: fix filter per: https://stackoverflow.com/a/53141199/624160. || https://youtu.be/Elg2zDVIcLo?t=276
      let filters = 
        rTypes.map((o) => {
          return window.fireDB.collection("resource_types").doc(o.id);
        })
      
      console.log("FILTERING RESOURCE TYPES: ", filters);
      collection = collection.where("resource_type", "in", filters);
    }

    if (this.state.hasOfficeHours === true) {
      collection = collection.where("office_hours", "!=", false);
    }

    let snapshots = await collection.limit(25).get();
    const resources = await Promise.all(
      snapshots.docs.map(async (doc) => normalizeResource(doc, ["image", "author", "resource_type"]))
    );
    console.log(resources, "resources");
    this.setState({ resources, loading: false });
  }

  render() {
    const { classes } = this.props;

    const breakpoints = {
      default: 3,
      1100: 2,
      700: 1,
    };

    return (
      <React.Fragment>
        <Grid container item className={classes.sectionSecondary}>
          <Grid item xs={10}>
            <Typography variant={"h5"} className={classes.sectionTitle}>
              <b>Request and Receive Help From Your Community</b>
            </Typography>
            <Typography variant={"h6"} className={classes.sectionSubtitle}>
              Pay with cash or CitizenCoin earned through contributions to this
              community platform
            </Typography>
            <NavLink to={"/c/resources#new"} style={{ textDecoration: "none" }}>
              <Button className={classes.sectionRightButton}>
                Offer Your Expertise
              </Button>
            </NavLink>
          </Grid>
          <Grid item xs={2}>
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
        <Grid
          className={classes.section}
          alignContent={"center"}
          justify={"space-around"}
          wrap={"nowrap"}
        >
          <Grid item style={{ flexGrow: 1 }}>
            <Select
              id="resource_type_filter"
              displayEmpty={true}
              multiple={true}
              fullWidth={true}
              value={this.state.selected}
              onChange={(e) => this.handleChange(e.target.value)}
              label="Resource Types"
              renderValue={(selected) => {
                if (selected.length === 0) {
                  return (
                    <Typography
                      variant={"body1"}
                      style={{ color: this.props.theme.palette.text.disabled }}
                    >
                      All Resource Types
                    </Typography>
                  );
                }
                return selected.map((o) => o.type).join(", ");
              }}
            >
              <MenuItem disabled value={""}>
                All Resource Types
              </MenuItem>
              {this.state.rTypes.map((option) => (
                <MenuItem key={option.type} value={option}>
                  {option.type}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item>
            <FormControlLabel
              value={this.state.hasOfficeHours}
              style={{
                marginLeft: 0,
                color:
                  this.props.theme.palette.text[
                    this.state.hasOfficeHours ? "primary" : "hint"
                  ],
              }}
              control={
                <Checkbox
                  onChange={(e) => {
                    this.setState({ hasOfficeHours: e.target.checked }, () =>
                      this.handleChange(this.state.selected)
                    );
                  }}
                  checked={this.state.hasOfficeHours}
                  color="primary"
                />
              }
              label="Office Hours"
              labelPlacement="start"
            />
          </Grid>
          {/*  <Grid item>
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
        </Grid>
        <Masonry
          breakpointCols={breakpoints}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {(this.state.loading ? [1, 2, 3, 4, 5, 6] : this.state.resources).map((item, key) => (
            <div key={"resource" + key}>
              <ResourceItem item={item} loading={this.state.loading} />
            </div>))}
        </Masonry>
      </React.Fragment>
    );
  }
}

export default withStyles(rallyStyles, { withTheme: true })(
  withSnackbar(Resources)
);
