import React, {Component} from "react";
import {withSnackbar} from "notistack";
import {makeStyles, withStyles} from "@material-ui/core/styles";
import Stepper from "@material-ui/core/Stepper";
import Box from "@material-ui/core/Box";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import StepConnector from "@material-ui/core/StepConnector";
import clsx from "clsx";
import Check from "@material-ui/icons/Check";
import CreateRallyMeetingDetailsTab from "../components/CreateRallyMeetingDetailsTab";
import CreateRallyTab from "../components/CreateRallyTab";
import {rallyStyles} from "../Util/ThemeUtils";

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
        borderColor: theme.palette.info.contrastText,
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
    const {active, completed} = props;
    return (
        <div
            className={clsx(classes.root, {
                [classes.active]: active,
            })}
        >
            {completed ? (
                <Check className={classes.completed}/>
            ) : (
                <div className={classes.circle}/>
            )}
        </div>
    );
}

class RallyCreate extends Component {
    constructor(p) {
        super(p);
        this.state = {page: 0}
    }

    render() {
        const {classes} = this.props;

        let tabForm = this.props.children;
        if (this.state.page === 1) {
            tabForm = <CreateRallyTab/>
        } else if (this.state.page === 2) {
            tabForm = <CreateRallyMeetingDetailsTab/>;
        }

        return (
            <Box className={classes.createRallySection}>
                <Stepper
                    alternativeLabel
                    activeStep={this.state.page}
                >
                    <Step onClick={() => this.setState({page: 0})}>
                        <StepLabel StepIconComponent={QontoStepIcon}>Create a Rally</StepLabel>
                    </Step>
                    <Step onClick={() => this.setState({page: 1})}>
                        <StepLabel StepIconComponent={QontoStepIcon}>Meeting Details</StepLabel>
                    </Step>
                    <Step onClick={() => this.setState({page: 2})}>
                        <StepLabel StepIconComponent={QontoStepIcon}>Review & Share</StepLabel>
                    </Step>
                </Stepper>
                {tabForm}
            </Box>
        );
    }
}

export default withStyles(rallyStyles, {withTheme: true})(withSnackbar(RallyCreate));
