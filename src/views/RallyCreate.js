import React, { Component } from "react";
import { withSnackbar } from "notistack";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import Stepper from "@material-ui/core/Stepper";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import { DropzoneArea } from "material-ui-dropzone";
import Box from "@material-ui/core/Box";
import Avatar from "@material-ui/core/Avatar";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import StepConnector from "@material-ui/core/StepConnector";
import clsx from "clsx";
import Check from "@material-ui/icons/Check";
import CreateRallyMeetingDetailsTab from "../components/CreateRallyMeetingDetailsTab";
import CreateRallyMeetingTimeAgendaTab from "../components/CreateRallyMeetingTimeAgendaTab";
class RallyCreate extends Component {
  //   constructor(props){
  //     super(props)
  //     this.state = {selectValue: null, files: []}
  // }
  render() {
    const { classes } = this.props;

    //   //Create Rally

    //   const RallyAboutOptions = [
    //     {
    //     value: 'Theme 1',
    //     label: 'Theme 1',
    //     },
    //     {
    //     value: 'Theme 2',
    //     label: 'Theme 2',
    //     },
    //     {
    //     value: 'Theme 3',
    //     label: 'Theme 3',
    //     },
    //     {
    //     value: 'Theme 4',
    //     label: 'Theme 4',
    //     },
    // ];

    const CreateRallyItems = [
      {
        img: "/images/democrasee_logo_black.png",
        title: "Get 100 Citizen Coins",
      },
      {
        img: "/images/democrasee_logo_black.png",
        title: "Organizer Badge",
      },
    ];
    const QontoConnector = withStyles({
      alternativeLabel: {
        top: 10,
        left: "calc(-50% + 16px)",
        right: "calc(50% + 16px)",
      },
      active: {
        "& $line": {
          borderColor: "#1c54b2",
        },
      },
      completed: {
        "& $line": {
          borderColor: "#1c54b2",
        },
      },
      line: {
        borderColor: "#eaeaf0",
        borderTopWidth: 10,
        borderRadius: 1,
      },
    })(StepConnector);

    const useQontoStepIconStyles = makeStyles({
      root: {
        color: "#eaeaf0",
        display: "flex",
        height: 22,
        alignItems: "center",
      },
      active: {
        color: "#1c54b2",
      },
      circle: {
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: "currentColor",
      },
      completed: {
        color: "#1c54b2",
        zIndex: 1,
        fontSize: 18,
      },
    });
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
      </Box>
      //     <Typography variant={'h5'} className={classes.createRallyTitle}> <b>Create a Rally</b></Typography>
      //     <Typography variant={'body1'} className={classes.createRallyDescription}>A rally is an event that people can join to discuss specific topics and come up with solutions to the most pressing problems</Typography>
      //     <Grid container spacing={4} className={classes.itemsContainer}>
      //         {
      //             CreateRallyItems.map(item => {
      //                 return (
      //                     <>
      //                         <Grid item>
      //                         <Box display="flex" alignItems="center">
      //                             <Avatar variant="square" src={item.img}/>
      //                             <Typography variant="body2">{item.title}</Typography>
      //                         </Box>
      //                         </Grid>
      //                     </>)
      //             })
      //         }
      //     </Grid>
      //     <form className={classes.root} noValidate autoComplete="off">
      //         <Typography variant={'body1'} className={classes.formTitle}> <b>Tell us a little more about the rally:</b></Typography>
      //         <TextField
      //             id="outlined-select-currency-native"
      //             select
      //             label="What is this meeting about ?"
      //             value={this.state.selectValue}
      //             onChange={(event) => this.setState({selectValue: event.target.value})}
      //             SelectProps={{
      //                 native: true,
      //             }}
      //             variant="outlined"
      //             >
      //             {RallyAboutOptions.map((option) => (
      //                 <option key={option.value} value={option.value}>
      //                 {option.label}
      //                 </option>
      //             ))}
      //         </TextField>
      //         <FormControl  className={classes.margin} variant="outlined" fullWidth>
      //             <InputLabel htmlFor="outlined-adornment-amount">Create a title for your rally:</InputLabel>
      //             <OutlinedInput label="Create a title for your rally:" placeholder="Rally title"/>
      //         </FormControl>
      //         <FormControl className={classes.margin} variant="outlined" fullWidth>
      //             <InputLabel htmlFor="outlined-adornment-amount">Create a title for your rally:</InputLabel>
      //             <OutlinedInput multiline rows={6} label="Create a title for your rally:" placeholder="Short description"/>
      //         </FormControl>
      //         <FormControl className={classes.margin} variant="outlined" fullWidth>
      //             <InputLabel htmlFor="outlined-adornment-amount">Who does this issue affect? (stakeholders)</InputLabel>
      //             <OutlinedInput
      //                 className={classes.formCustomInput}
      //                 label="Who does this issue affect? (stakeholders)"
      //                 placeholder="Citizens"
      //             />
      //         </FormControl>
      //         <InputLabel htmlFor="outlined-adornment-amount" className={classes.dropZoneLabel}>Cover Picture:</InputLabel>
      //         <FormControl variant="outlined" fullWidth>
      //             <DropzoneArea/>
      //         </FormControl>
      //         <Button className={classes.nextButton}>Next</Button>
      //     </form>
      // </Box>
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
  createRallySection: {
    padding: "0 100px",
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
    background: "#1c54b2",
    color: "white",
    textTransform: "none",
    "&:hover": {
      background: "#1c54b2",
      color: "white",
    },
    margin: "30px 0",
  },
  itemsContainer: {
    marginBottom: "30px",
  },
  stepper: {
    margin: "40px 0 60px 0",
  },
});

export default withStyles(useStyles, { withTheme: true })(
  withSnackbar(RallyCreate)
);
