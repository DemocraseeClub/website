import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { withSnackbar } from "notistack";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import MeetingTimeAgendaCard from "./MeetingTimeAgendaCard";
import Grid from "@material-ui/core/Grid";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import RemoveCircleIcon from "@material-ui/icons/RemoveCircle";
import SwapVerticalCircleIcon from "@material-ui/icons/SwapVerticalCircle";
import Button from "@material-ui/core/Button";

class CreateRallyMeetingTimeAgendaTab extends Component {
  render() {
    const { classes } = this.props;

    return (
      <Box>
        <Typography variant={"h5"} className={classes.title}>
          {" "}
          <b>Meeting Time and Agenda</b>
        </Typography>
        <Typography variant={"body1"} className={classes.description}>
          Create a plan to give structure and timing to your meeting.
        </Typography>
        <Grid container>
          <Grid item xs={12} sm={8}>
            <Typography variant={"body1"}>
              <b>Meeting Agenda</b>
            </Typography>
            <MeetingTimeAgendaCard />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box
              display="flex"
              flexDirection="column"
              className={classes.buttonsContainer}
            >
              {" "}
              <Box display="flex" alignItems="center">
                <AddCircleIcon className={classes.icon} />
                <Typography variant={"body1"} className={classes.buttonLabel}>
                  Add Item
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <RemoveCircleIcon className={classes.icon} />
                <Typography variant={"body1"} className={classes.buttonLabel}>
                  Remove Item
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <SwapVerticalCircleIcon className={classes.icon} />
                <Typography variant={"body1"} className={classes.buttonLabel}>
                  Move Order
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
        <Button className={classes.nextButton}>Next</Button>
      </Box>
    );
  }
}

const useStyles = () => ({
  title: {
    marginBottom: "20px",
  },
  description: {
    marginBottom: "20px",
  },
  icon: {
    fontSize: "70px",
    color: "#1c54b2",
  },
  buttonLabel: {
    marginLeft: "10px",
  },
  buttonsContainer: {
    padding: "20px 0 0 30px",
  },
  nextButton: {
    padding: "10px 40px",
    background: "#1c54b2",
    color: "white",
    textTransform: "none",
    "&:hover": {
      background: "#1c54b2",
      color: "white",
    },
    margin: "30px 0",
  },
});

export default withStyles(useStyles, { withTheme: true })(
  withSnackbar(CreateRallyMeetingTimeAgendaTab)
);
