import React, {Component} from "react";
import {withStyles} from "@material-ui/core/styles";
import {withSnackbar} from "notistack";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import "date-fns";
import DateFnsUtils from "@date-io/date-fns";
import {KeyboardDatePicker, KeyboardTimePicker, MuiPickersUtilsProvider,} from "@material-ui/pickers";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import MenuItem from "@material-ui/core/MenuItem";
import Button from "@material-ui/core/Button";

class CreateRallyMeetingDetailsTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDate: new Date("2014-08-18T21:11:54"),
      currency: "LAN",
    };
  }
  render() {
    const { classes } = this.props;
    const currencies = [
      {
        value: "USD",
        label: "$",
      },
      {
        value: "EUR",
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
    return (
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Box className={classes.container}>
          <Typography variant={"h5"} className={classes.title}>
            {" "}
            <b>Rally Meeting Details</b>
          </Typography>
          <Typography variant={"body1"} className={classes.description}>
            Add your first meeting for this Rally. You can hold just one, or
            many meetings.
          </Typography>
          <KeyboardDatePicker
            className={classes.input}
            disableToolbar
            variant="inline"
            format="MM/dd/yyyy"
            margin="normal"
            id="date-picker-inline"
            label="Select date"
            value={this.state.selectedDate}
            KeyboardButtonProps={{
              "aria-label": "change date",
            }}
          />
          <Grid container spacing={5}>
            <Grid item>
              <KeyboardTimePicker
                margin="normal"
                id="time-picker"
                label="Start time"
                value={this.state.selectedDate}
                KeyboardButtonProps={{
                  "aria-label": "change time",
                }}
              />
            </Grid>
            <Grid item>
              <KeyboardTimePicker
                margin="normal"
                id="time-picker"
                label="End time"
                value={this.state.selectedDate}
                KeyboardButtonProps={{
                  "aria-label": "change time",
                }}
              />
            </Grid>
          </Grid>
          <Grid container spacing={5}>
            <Grid item>
              <TextField
                className={classes.input}
                id="outlined-select-currency"
                select
                label="Rally State"
                value={this.state.currency}
                variant="outlined"
                placeholder="Kansas"
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
                className={classes.input}
                id="outlined-textarea"
                label="Rally State"
                placeholder="Los angeles"
                variant="outlined"
              />
            </Grid>
          </Grid>
          <Grid container direction="column">
            <Grid item>
              <TextField
                className={classes.lastThirdInput}
                id="outlined-select-currency"
                select
                label="How do you meet ?"
                value={this.state.currency}
                variant="outlined"
                placeholder="Virtual Rally"
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
                className={classes.lastSecondInput}
                id="outlined-textarea"
                label="Address"
                placeholder="123 Street"
                variant="outlined"
              />
            </Grid>
            <Grid item>
              <Grid
                container
                className={classes.addressInputsContainer}
                spacing={5}
              >
                <Grid item>
                  <TextField
                    className={classes.input}
                    id="outlined-textarea"
                    label="City"
                    placeholder="Los angeles"
                    variant="outlined"
                  />
                </Grid>
                <Grid item>
                  <TextField
                    className={classes.stateInput}
                    id="outlined-select-currency"
                    select
                    label="State"
                    value={this.state.currency}
                    variant="outlined"
                    placeholder="California"
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
                    className={classes.zipInput}
                    id="outlined-number"
                    label="Zip"
                    type="number"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <TextField
                className={classes.lastThirdInput}
                id="outlined-select-currency"
                select
                label="What is the goal of the rally?"
                value={this.state.currency}
                variant="outlined"
                placeholder="To workshop and idea"
              >
                {currencies.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item>
              <Button className={classes.nextButton}>Next</Button>
            </Grid>
          </Grid>
        </Box>
      </MuiPickersUtilsProvider>
    );
  }
}

const useStyles = () => ({
  container: {
    padding: "0 100px",
  },
  title: {
    marginBottom: "20px",
  },
  description: {
    marginBottom: "20px",
  },
  input: {
    minWidth: "250px",
    marginBottom: "20px",
  },
  lastThirdInput: {
    marginTop: "20px",
    minWidth: "250px",
  },
  lastSecondInput: {
    marginTop: "20px",
    width: "70%",
  },
  lastOneInput: {
    marginTop: "20px",
    minWidth: "250px",
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
  addressInputsContainer: {
    marginTop: "20px",
  },
  stateInput: {
    width: "175px",
  },
  zipInput: {
    width: "100px",
  },
});

export default withStyles(useStyles, { withTheme: true })(
  withSnackbar(CreateRallyMeetingDetailsTab)
);
