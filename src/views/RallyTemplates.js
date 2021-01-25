import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Box from "@material-ui/core/Box";
import {rallyStyles} from '../Util/ThemeUtils';
import {withRouter} from "react-router";

class RallyTemplates extends React.Component {

    render() {
        const {classes} = this.props;
        return (
            <div style={{padding:20}}>

                <Box mt={2} mb={6}>
                    <Typography variant={'h1'}>Pick a Meeting Template</Typography>
                    <Typography variant={'body1'}>Within a Rally, several meetings are needed to move from starting the conversation on Democrasee to taking an action toward policy impact. This strategy outlines the use of 2 frameworks to inform the sequencing and substance of the meetings within a rally. There are 4 main meeting types intended to be scheduled in sequential order based on the Creative Problem Solving Process, in addition to 7 additional types based on the 7 Wise Democracy pattern categories. Depending on the rally topic and number of participants, the group might accomplish an action plan in 4 meetings or it might take 7, 10, etc.</Typography>
                </Box>

                <Box>
                    <Box item className={classes.topLevelLabel} mt={2} mb={2} onClick={e => this.props.history.push(`/rally/templates/meeting/kickoff`)}>
                        <div>
                            <Typography variant={'h2'} className={classes.stepLabelText}>Kickoff</Typography>
                            <Typography variant={'body1'}>Choose this template to get started</Typography>
                        </div>
                        <Typography variant={'caption'}>diversity ● big picture ● caring</Typography>
                    </Box>
                    <Box item className={classes.topLevelLabel} mt={2} mb={2} onClick={e => this.props.history.push(`/rally/templates/meeting/brainstorm`)}>
                        <div>
                            <Typography variant={'h2'} className={classes.stepLabelText}>Brainstorming</Typography>
                            <Typography variant={'body1'}>Choose this template if you want to gather all ideas, aka diverge</Typography>
                        </div>
                        <Typography variant={'caption'}>interaction ● diversity ● big picture</Typography>
                    </Box>
                    <Box item  className={classes.topLevelLabel} mt={2} mb={2} onClick={e => this.props.history.push(`/rally/templates/meeting/planning`)}>
                        <div>
                            <Typography variant={'h2'} className={classes.stepLabelText}>Planning</Typography>
                            <Typography variant={'body1'}>Choose this template when you’re ready to plan</Typography>
                        </div>
                        <Typography variant={'caption'}>interaction ● sustainability ● caring</Typography>
                    </Box>
                    <Box item className={classes.topLevelLabel} mt={2} mb={2} onClick={e => this.props.history.push(`/rally/templates/meeting/action`)}>
                        <div>
                            <Typography variant={'h2'} className={classes.stepLabelText}>Action plan</Typography>
                            <Typography variant={'body1'}>Choose this template to guide your conversation towards concrete action</Typography>
                        </div>
                        <Typography variant={'caption'}>action ● realizing potential</Typography>
                    </Box>
                    <Box item className={classes.topLevelLabel} mt={2} mb={2} onClick={e => this.props.history.push(`/rally/templates/meeting/course`)}>
                        <div>
                            <Typography variant={'h2'} className={classes.stepLabelText}>Course</Typography>
                            <Typography variant={'body1'}>Choose this template to write up a lesson plan for screen and document sharing</Typography>
                        </div>
                        <Typography variant={'caption'}>action ● realizing potential</Typography>
                    </Box>
                </Box>
            </div>
        );
    }
}

export default withRouter(withStyles(rallyStyles, {withTheme:true})(RallyTemplates));
