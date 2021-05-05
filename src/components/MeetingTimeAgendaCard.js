import React, {Component} from "react";
import {withStyles} from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import {DropzoneArea} from "material-ui-dropzone";
import Box from "@material-ui/core/Box";
import Modal from "@material-ui/core/Modal";
import Button from "@material-ui/core/Button";
import RemoveIcon from "@material-ui/icons/Remove";
import SwapVerticalCircleIcon from "@material-ui/icons/SwapVerticalCircle";

class MeetingTimeAgendaCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }

  handleOpen = () => {
    this.setState({
      open: true,
    });
  };

  handleClose = () => {
    this.setState({
      open: false,
    });
  };

  body = (
    <Paper className={this.props.classes.paperModal}>
      <Typography variant={"h5"} className={this.props.classes.modalTitle}>
        {" "}
        <b>Add related research</b>
      </Typography>
      <Typography
        variant={"body1"}
        className={this.props.classes.modalDescription}
      >
        Add research links that help support your agenda.
      </Typography>
      <TextField
        className={this.props.classes.titleInput}
        id="outlined-textarea"
        label="Link URL"
        placeholder="https://website.com"
        variant="outlined"
      />
      <Button className={this.props.classes.modalSaveButton}>Save</Button>
      <Button className={this.props.classes.modalCancelButton}>Cancel</Button>
    </Paper>
  );
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
        <Typography
          variant={"body1"}
          className={classes.addRelatedContentLink}
          onClick={this.handleOpen}
        >
          Add related research (optional)
        </Typography>
        <Box
          display="flex"
          justifyContent="space-around"
          alignItems="center"
          className={classes.agendaItemSaved}
        >
          <img
            src="/images/democrasee_logo_black.png"
            alt="example logo"
            className={classes.agendaItemSavedImg}
          />
          <Typography
            variant={"body1"}
            className={classes.addRelatedContentLink}
            onClick={this.handleOpen}
          >
            Link - get title/image from meta ...
          </Typography>
          <RemoveIcon />
          <SwapVerticalCircleIcon />
        </Box>
        <Modal
          className={classes.modal}
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
        >
          {this.body}
        </Modal>
      </Paper>
    );
  }
}

const useStyles = theme => ({
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
    margin: "30px 0",
    color: theme.palette.info.main,
    textDecoration: "underline",
  },
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  paperModal: {
    position: "absolute",
    width: 600,
    backgroundColor: "white",
    border: "0",
    padding: "30px 50px",
  },
  modalTitle: {
    marginBottom: "20px",
  },
  modalDescription: {
    marginBottom: "20px",
  },
  modalCancelButton: {
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
  modalSaveButton: {
    padding: "10px 40px",
    background: "white",
    color: theme.palette.info.main,
    textTransform: "none",
    "&:hover": {
      background: "white",
      color: theme.palette.info.main,
    },
    margin: "30px 20px 30px 0",
    border: `1px solid ${theme.palette.info.main}`,
  },
  agendaItemSavedImg: {
    width: "60px",
  },
  agendaItemSaved: {
    border: "1px solid gray",
  },
});

export default withStyles(useStyles, { withTheme: true })(
  MeetingTimeAgendaCard
);
