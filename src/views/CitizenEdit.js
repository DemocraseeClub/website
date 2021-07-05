import React from "react";
import { rallyStyles } from "../Util/ThemeUtils";
import { withStyles } from "@material-ui/core/styles";
import { withRouter } from "react-router";
import { withCmsHooks } from "./firebaseCMS/FirebaseCMS";
import { withSnackbar } from "notistack";
import Paper from "@material-ui/core/Paper";
import Avatar from "@material-ui/core/Avatar";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import ImageIcon from "@material-ui/icons/Image";
import SaveIcon from "@material-ui/icons/Save";
import { normalizeUser } from "../redux/entityDataReducer";
import CircularProgress from "@material-ui/core/CircularProgress";
import Box from "@material-ui/core/Box";

class CitizenEdit extends React.Component {
  constructor(p) {
    super(p);
    this.state = {
      loading: true,
      realName: null,
      displayName: null,
      website: null,
      bio: null,
      picture: null,
    };
  }

  componentDidMount() {
    this.fetchCitizenInfo();
  }

  async fetchCitizenInfo() {
    //get citizen
    let auxCitizen = await window.fireDB
      .collection("users")
      .doc(this.props.match.params.uid)
      .get();

    let citizen = await normalizeUser(auxCitizen, ["picture", "coverPhoto"]);

    const { realName, displayName, website, bio, picture } = citizen;

    this.setState({
      realName,
      displayName,
      website,
      bio,
      picture,
      loading: false,
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    const { realName, displayName, website, bio } = this.state;

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ realName, displayName, website, bio }),
    };

    fetch(
      process.env.REACT_APP_FUNCTIONS_URL + "citizen/:uid/edit",
      requestOptions
    )
      .then((response) => response.json())
      .then((data) => console.log(data, ""));
  }

  render() {
    const { realName, displayName, website, bio, picture, loading } =
      this.state;
    const { classes } = this.props;

    return (
      <Paper className={classes.root}>
        <Box display="flex" justifyContent="center">
          <form
            className={classes.profileEditFormContainer}
            onSubmit={this.handleSubmit.bind(this)}
          >
            <Grid container justify="start" spacing={3}>
              <Grid item md={6}>
                {" "}
                <Avatar
                  src={picture && picture}
                  alt="Citizen pic"
                  className={classes.profileEditPicture}
                >
                  {loading && <CircularProgress />}
                </Avatar>
              </Grid>
              <Grid item md={6}>
                <Typography variant="h1" className={classes.profileName}>
                  User Profile{" "}
                </Typography>
              </Grid>
              <Grid item md={6}>
                <input
                  accept="image/*"
                  type="file"
                  id="icon-button-file"
                  style={{ display: "none" }}
                />
                <label htmlFor="icon-button-file">
                  <Button
                    variant="contained"
                    component="span"
                    size="large"
                    color="primary"
                  >
                    <ImageIcon />
                    Change profile photo
                  </Button>
                </label>
              </Grid>
              <Grid item md={6}>
                <input
                  accept="image/*"
                  type="file"
                  id="icon-button-file"
                  style={{ display: "none" }}
                />
                <label htmlFor="icon-button-file">
                  <Button
                    variant="contained"
                    component="span"
                    size="large"
                    color="primary"
                  >
                    <ImageIcon />
                    Change cover photo
                  </Button>
                </label>
              </Grid>
              <Grid item md={6}>
                {" "}
                <TextField
                  InputLabelProps={{ shrink: true }}
                  className={classes.profileEditInput}
                  label="Real Name"
                  variant="outlined"
                  required
                  value={realName}
                  onChange={(e) =>
                    this.setState({ ...this.state, realName: e.target.value })
                  }
                  InputProps={{
                    endAdornment: <>{loading ? <CircularProgress /> : <></>}</>,
                  }}
                />
              </Grid>
              <Grid item md={6}>
                {" "}
                <TextField
                  InputLabelProps={{ shrink: true }}
                  className={classes.profileEditInput}
                  label="Display Name"
                  variant="outlined"
                  required
                  value={displayName}
                  InputProps={{
                    endAdornment: <>{loading ? <CircularProgress /> : <></>}</>,
                  }}
                  onChange={(e) =>
                    this.setState({
                      ...this.state,
                      displayName: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item md={6}>
                {" "}
                <TextField
                  InputLabelProps={{ shrink: true }}
                  className={classes.profileEditInput}
                  label="Website"
                  variant="outlined"
                  value={website}
                  InputProps={{
                    endAdornment: <>{loading ? <CircularProgress /> : <></>}</>,
                  }}
                  required
                  onChange={(e) =>
                    this.setState({
                      ...this.state,
                      website: e.target.value,
                    })
                  }
                />
              </Grid>{" "}
              <Grid item md={12}>
                {" "}
                <TextField
                  InputLabelProps={{ shrink: true }}
                  className={classes.profileEditInput}
                  label="Biography"
                  multiline
                  rows={8}
                  variant="outlined"
                  value={bio}
                  InputProps={{
                    endAdornment: <>{loading ? <CircularProgress /> : <></>}</>,
                  }}
                  required
                  onChange={(e) =>
                    this.setState({
                      ...this.state,
                      bio: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item md={12}>
                <Box display="flex" justifyContent="flex-end">
                  <Button
                    variant="contained"
                    size="large"
                    color="primary"
                    type="submit"
                  >
                    <SaveIcon />
                    Save{" "}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Paper>
    );
  }
}

export default withStyles(rallyStyles, { withTheme: true })(
  withSnackbar(withCmsHooks(withRouter(CitizenEdit)))
);
