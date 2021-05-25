import React from 'react';
// import {withStyles} from '@material-ui/core/styles';
// import Grid from '@material-ui/core/Grid';
import {NavLink} from "react-router-dom";
// import {rallyStyles} from "../Util/ThemeUtils";
// import List from '@material-ui/core/List';
// import ListItem from '@material-ui/core/ListItem';
// import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import moment from "moment";
import Typography from "@material-ui/core/Typography";

class OfficeHours extends React.Component {

    recurringText() {
        let recur = this.props.office_hours.recurring;
        if (recur === 'none' || !this.props.office_hours.date_start) return '';

        // https://momentjs.com/docs/#/displaying/
        let start = moment(this.props.office_hours.date_start.seconds * 1000);
        let next = (start.isAfter()) ? start.format() : false;
        if (recur === 'daily') {
            recur = "Daily ";
        } else if (recur === 'weekly') {
            recur = "Weekly on " + start.format('dddd');
        } else if (recur === 'monthly') {
            let num = start.week() - start.startOf('month').week() + 1;
            recur = `Monthly on the ${num}${num === 1 ? 'st' : 'th'} ${start.format('dddd')}`;
        } else if (recur === 'weekdays') {
            recur = "Weekdays"
        }

        recur += " at " + start.format('LT');

        return <ListItemText primary={recur} secondary={'Next office hours'} />;

    }

    renderLink() {
        if (this.props.office_hours.link) return <ListItemText primary={<a href={this.props.office_hours.link} target={"_blank"}>{this.props.office_hours.link}</a>} secondary={'Video Link'} />;

        // TODO: only show if next moment is within 10 minutes
        return <Typography variant={"body2"} ><NavLink to={`/office-hours/${this.props.author.id}`}>Enter Room</NavLink></Typography>
    }

    render() {
        return (
            <React.Fragment>
                {this.recurringText()}
                {this.renderLink()}
            </React.Fragment>
        );
    }

}

// export default withStyles(rallyStyles, {withTheme: true})(OfficeHours);
export default OfficeHours;
