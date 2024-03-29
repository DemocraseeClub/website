import React, {Component} from "react";
import {withStyles} from "@material-ui/core/styles";
import {withSnackbar} from "notistack";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import MeetingTimeAgendaSavedItem from "../components/MeetingTimeAgendaSavedItem";
import Box from "@material-ui/core/Box";

class CreateRallyMeetingTimeAgendaTab extends Component {
  render() {
    const { classes } = this.props;
    const savedItems = [
      {
        time: "10 mins",
        title: "First agenda item-speaker introduction",
        img: null,
        relatedResearchItems: null,
      },
      {
        time: "45 mins",
        title: "Second item with image and research",
        img: null,
        relatedResearchItems: 2,
      },
      {
        time: "10 mins",
        title:
          "Third item - no image, really long title on two + lines and overshoots the time - so time highlights red",
        img: null,
        relatedResearchItems: null,
      },
    ];
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
          {/* <Grid item xs={12} sm={8}>
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
          </Grid> */}
        </Grid>
        {savedItems.map(() => (
          <MeetingTimeAgendaSavedItem />
        ))}
        <Button className={classes.nextButton}>Next</Button>
      </Box>
    );
  }
}

const useStyles = theme => ({
  title: {
    marginBottom: "20px",
  },
  description: {
    marginBottom: "20px",
  },
  icon: {
    fontSize: "70px",
    color: theme.palette.info.main,
  },
  buttonLabel: {
    marginLeft: "10px",
  },
  buttonsContainer: {
    padding: "20px 0 0 30px",
  },
  nextButton: {
    padding: "10px 40px",
    background: theme.palette.info.main,
    color: "white",
    textTransform: "none",
    "&:hover": {
      background: theme.palette.info.main,
      color: "white",
    },
    margin: "30px 0",
  },
});

export default withStyles(useStyles, { withTheme: true })(
  withSnackbar(CreateRallyMeetingTimeAgendaTab)
);
