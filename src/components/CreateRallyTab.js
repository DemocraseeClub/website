import React, {Component} from "react";
import {withStyles} from "@material-ui/core/styles";
import {withSnackbar} from "notistack";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Avatar from "@material-ui/core/Avatar";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import {DropzoneArea} from "material-ui-dropzone";
import Button from "@material-ui/core/Button";

class CreateRallyTab extends Component {
  constructor(props) {
    super(props);
    this.state = { selectValue: null, files: [] };
  }

  render() {
    const { classes } = this.props;
    //Create Rally

    const RallyAboutOptions = [
      {
        value: "Theme 1",
        label: "Theme 1",
      },
      {
        value: "Theme 2",
        label: "Theme 2",
      },
      {
        value: "Theme 3",
        label: "Theme 3",
      },
      {
        value: "Theme 4",
        label: "Theme 4",
      },
    ];

    const CreateRallyItems = [
      {
        img: "/images/coin.png",
        title: "Get 100 Citizen Coins",
      },
      {
        img: "/images/storyteller.jpeg",
        title: "Organizer Badge",
      },
    ];

    return (
      <>
        <Typography variant={"h5"} className={classes.createRallyTitle}>
          {" "}
          <b>Create a Rally</b>
        </Typography>
        <Typography
          variant={"body1"}
          className={classes.createRallyDescription}
        >
          A rally is an event that people can join to discuss specific topics
          and come up with solutions to the most pressing problems
        </Typography>
        <Grid container spacing={4} className={classes.itemsContainer}>
          {CreateRallyItems.map((item) => {
            return (
              <>
                <Grid item>
                  <Box display="flex" alignItems="center">
                    <Avatar
                      variant="square"
                      src={item.img}
                      className={classes.createRallyItemImg}
                    />
                    <Typography variant="body2">{item.title}</Typography>
                  </Box>
                </Grid>
              </>
            );
          })}
        </Grid>
        <form className={classes.root} noValidate autoComplete="off">
          <Typography variant={"body1"} className={classes.formTitle}>
            {" "}
            <b>Tell us a little more about the rally:</b>
          </Typography>
          <TextField
            id="outlined-select-currency-native"
            select
            label="What is this meeting about ?"
            value={this.state.selectValue}
            onChange={(event) =>
              this.setState({ selectValue: event.target.value })
            }
            SelectProps={{
              native: true,
            }}
            variant="outlined"
          >
            {RallyAboutOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </TextField>
          <FormControl className={classes.margin} variant="outlined" fullWidth>
            <InputLabel htmlFor="outlined-adornment-amount">
              Create a title for your rally:
            </InputLabel>
            <OutlinedInput
              label="Create a title for your rally:"
              placeholder="Rally title"
            />
          </FormControl>
          <FormControl className={classes.margin} variant="outlined" fullWidth>
            <InputLabel htmlFor="outlined-adornment-amount">
              Create a title for your rally:
            </InputLabel>
            <OutlinedInput
              multiline
              rows={6}
              label="Create a title for your rally:"
              placeholder="Short description"
            />
          </FormControl>
          <FormControl className={classes.margin} variant="outlined" fullWidth>
            <InputLabel htmlFor="outlined-adornment-amount">
              Who does this issue affect? (stakeholders)
            </InputLabel>
            <OutlinedInput
              className={classes.formCustomInput}
              label="Who does this issue affect? (stakeholders)"
              placeholder="Citizens"
            />
          </FormControl>
          <InputLabel
            htmlFor="outlined-adornment-amount"
            className={classes.dropZoneLabel}
          >
            Cover Picture:
          </InputLabel>
          <FormControl variant="outlined" fullWidth>
            <DropzoneArea />
          </FormControl>
          <Button className={classes.nextButton}>Next</Button>
        </form>
      </>
    );
  }
}

const useStyles = (theme) => ({
  root: {
    "& .MuiTextField-root": {
      margin: theme.spacing(1),
      width: "25ch",
    },
  },
  margin: {
    margin: theme.spacing(1),
  },
  createRallyItemImg: {
    marginRight: "10px",
  },
  createRallyTitle: {
    marginBottom: "20px",
  },
  createRallyDescription: {
    marginBottom: "20px",
  },
  formTitle: {
    marginBottom: "30px",
  },
  formCustomInput: {
    width: "60%",
  },
  dropZoneLabel: {
    margin: "20px 0",
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
  itemsContainer: {
    marginBottom: "30px",
  },
});

export default withStyles(useStyles, { withTheme: true })(
  withSnackbar(CreateRallyTab)
);
