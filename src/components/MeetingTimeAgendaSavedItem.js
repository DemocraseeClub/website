import React, {Component} from "react";
import {withStyles} from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import RemoveCircleOutlineOutlinedIcon from "@material-ui/icons/RemoveCircleOutlineOutlined";
import SwapVerticalCircleOutlinedIcon from "@material-ui/icons/SwapVerticalCircleOutlined";
import Typography from "@material-ui/core/Typography";

class MeetingTimeAgendaSavedItem extends Component {
  render() {
    const { classes } = this.props;
    return (
      <Grid container className={classes.container}>
        <Grid item xs={8}>
          <Paper elevation={3} square className={classes.card}>
            <Grid container alignItems="center" justify="space-around">
              <Grid item>
                <Typography variant={"body1"}>10 mins</Typography>
              </Grid>
              <Grid item>
                <Typography variant={"body1"}>
                  <b>First agenda item - speaker introduction</b>
                </Typography>
              </Grid>
              <Grid item>
                <img
                  src="/images/democrasee_logo_black.png"
                  alt="example logo"
                  className={classes.img}
                />
              </Grid>
            </Grid>
          </Paper>
          <Paper elevation={3} className={classes.relatedSearchItem}>
            <Typography variant={"body1"}>2 related research items</Typography>
          </Paper>
        </Grid>
        <Grid item xs={3} className={classes.buttonsContainer}>
          <RemoveCircleOutlineOutlinedIcon className={classes.icon} />
          <SwapVerticalCircleOutlinedIcon className={classes.icon} />
        </Grid>
      </Grid>
    );
  }
}

const useStyles = theme => ({
  container: {
    margin: "20px 0",
  },
  icon: {
    fontSize: "60px",
    color: theme.palette.info.main,
  },
  buttonsContainer: {
    display: "flex",
    marginLeft: "10px",
    alignItems: "center",
  },
  img: {
    width: "60px",
  },
  card: {
    position: "relative",
  },
  relatedSearchItem: {
    position: "absolute",
  },
});

export default withStyles(useStyles, { withTheme: true })(
  MeetingTimeAgendaSavedItem
);
