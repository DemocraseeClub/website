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
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import ImageIcon from "@material-ui/icons/Image";
import SaveIcon from "@material-ui/icons/Save";

class CitizenEdit extends React.Component {
  render() {
    const { classes } = this.props;
    return (
      <Paper className={classes.root}>
        <Box display="flex" justifyContent="center">
          <form className={classes.profileEditFormContainer}>
            <Grid container justify="center" spacing={3}>
              <Grid item md={6}>
                {" "}
                <Avatar
                  alt="Citizen pic"
                  className={classes.profileEditPicture}
                />
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
                    Change cover photo
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
                    Change profile photo
                  </Button>
                </label>
              </Grid>
              <Grid item md={6}>
                {" "}
                <TextField
                  className={classes.profileEditInput}
                  label="Full Name"
                  variant="outlined"
                />
              </Grid>
              <Grid item md={6}>
                {" "}
                <TextField
                  className={classes.profileEditInput}
                  label="Profession"
                  variant="outlined"
                />
              </Grid>
              <Grid item md={6}>
                {" "}
                <TextField
                  className={classes.profileEditInput}
                  label="Biography"
                  multiline
                  rows={8}
                  variant="outlined"
                />
              </Grid>
              <Grid item md={6}>
                {" "}
                <TextField
                  className={classes.profileEditInput}
                  label="Website"
                  variant="outlined"
                />
              </Grid>{" "}
              <Grid item md={12}>
                <Box display="flex" justifyContent="flex-end">
                  <Button
                    variant="contained"
                    component="span"
                    size="large"
                    color="primary"
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
