import React, { Component } from "react";
import { withSnackbar } from "notistack";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import Stepper from "@material-ui/core/Stepper";
import Box from "@material-ui/core/Box";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import StepConnector from "@material-ui/core/StepConnector";
import clsx from "clsx";
import Check from "@material-ui/icons/Check";
import CreateRallyMeetingTimeAgendaTab from "../components/CreateRallyMeetingTimeAgendaTab";
import CreateRallyTab from "../components/CreateRallyTab";
class RallyCreate extends Component {
  render() {
    const { classes } = this.props;

    const QontoConnector = withStyles(theme => ({
      alternativeLabel: {
        top: 10,
        left: "calc(-50% + 16px)",
        right: "calc(50% + 16px)",
      },
      active: {
        "& $line": {
          borderColor: theme.palette.info.main,
        },
      },
      completed: {
        "& $line": {
          borderColor: theme.palette.info.main,
        },
      },
      line: {
        borderColor: theme.palette.info.constrastText,
        borderTopWidth: 10,
        borderRadius: 1,
      },
    }))(StepConnector);

    const useQontoStepIconStyles = makeStyles(theme => ({
      root: {
        color: theme.palette.info.main,
        display: "flex",
        height: 22,
        alignItems: "center",
      },
      active: {
        color: theme.palette.info.main,
      },
      circle: {
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: "currentColor",
      },
      completed: {
        color: theme.palette.info.main,
        zIndex: 1,
        fontSize: 18,
      },
    }));
    function QontoStepIcon(props) {
      const classes = useQontoStepIconStyles();
      const { active, completed } = props;
      return (
        <div
          className={clsx(classes.root, {
            [classes.active]: active,
          })}
        >
          {completed ? (
            <Check className={classes.completed} />
          ) : (
            <div className={classes.circle} />
          )}
        </div>
      );
    }
    function getSteps() {
      return [
        "Create a Rally",
        "Meeting Details",
        "Meeting Agenda",
        "Research & Speakers",
        " Review & Share",
      ];
    }
    const steps = getSteps();

    return (
      <Box className={classes.createRallySection}>
        <Stepper
          alternativeLabel
          activeStep={1}
          connector={<QontoConnector />}
          className={classes.stepper}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel StepIconComponent={QontoStepIcon}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {/* <CreateRallyMeetingDetailsTab /> */}
        <CreateRallyMeetingTimeAgendaTab />
        {/* <CreateRallyTab /> */}
      </Box>
    );
  }
}

const useStyles = () => ({
  createRallySection: {
    padding: "0 100px",
  },

  stepper: {
    margin: "40px 0 60px 0",
  },
});

export default withStyles(useStyles, { withTheme: true })(
  withSnackbar(RallyCreate)
);
