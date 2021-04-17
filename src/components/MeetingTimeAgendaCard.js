import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import { DropzoneArea } from "material-ui-dropzone";
import Box from "@material-ui/core/Box";

class MeetingTimeAgendaCard extends Component {
  render() {
    const { classes } = this.props;
    return (
      <Paper className={classes.container} elevation={3} square>
        {" "}
        <TextField
          className={classes.titleInput}
          id="outlined-textarea"
          label="Item title"
          placeholder="Agenda Item"
          variant="outlined"
        />
        <Box
          display="flex"
          alignItems="center"
          className={classes.timeInputContainer}
        >
          <TextField
            label="Estimated Time Length"
            className={classes.timeInput}
            placeholder="10"
            variant="outlined"
            id="standard-number"
            type="number"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <Typography variant={"body1"}>Minutes</Typography>
        </Box>
        <Typography className={classes.dropzoneTitle} variant={"body1"}>
          Image (Optional)
        </Typography>
        <DropzoneArea />
        <Typography variant={"body1"} className={classes.addRelatedContentLink}>
          Add related research (optional)
        </Typography>
      </Paper>
    );
  }
}

const useStyles = () => ({
  container: {
    padding: "30px 50px",
    margin: "10px 0",
  },
  titleInput: {
    width: "100%",
  },
  timeInput: {
    width: "170px",
    marginRight: "20px",
  },
  timeInputContainer: {
    marginTop: "30px",
  },
  dropzoneTitle: {
    marginTop: "30px",
  },
  addRelatedContentLink: {
    marginTop: "30px",
    color: "#1c54b2",
    textDecoration: "underline",
  },
});

export default withStyles(useStyles, { withTheme: true })(
  MeetingTimeAgendaCard
);
