import {normalizeRally} from '../redux/entityDataReducer';
import React, {Component} from 'react';
import {withRouter} from 'react-router';
import Typography from "@material-ui/core/Typography";
import ProgressLoading from "../components/ProgressLoading";
import RallyBlock from "../components/RallyBlock";
import Box from "@material-ui/core/Box";
import {NavLink} from "react-router-dom";
import Paper from "@material-ui/core/Paper";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItemText from '@material-ui/core/ListItemText';
import moment from "moment";

class RallyHome extends Component {

    constructor(p) {
        super(p);
        this.state = {editMode: false, loading: true,
            rally: false,
            error: null};
    }

    componentDidMount() {
        this.refresh();
    }

    componentDidUpdate(prevProps) {
        if (this.props.location.pathname !== prevProps.location.pathname || this.props.location.search !== prevProps.location.search) {
            this.refresh();
        }
    }

    async refresh() {
        const roomRef = window.fireDB.collection("rallies").doc(this.props.match.params.rid)
        let doc = await roomRef.get();
        if (doc.exists) {
            let rally = await normalizeRally(doc, ["author", "picture", "promo_video", "meetings", "topics", "stakeholders", "wise_demo"]);
            let meeting = false;
            if (rally?.meetings.length > 0){
                meeting = rally.meetings[0];
            }
            this.setState({rally, meeting, loading:false, error:false})
        } else {
            this.setState({rally:false, loading:false, error:'invalid id'})
        }
    }

    render() {
        if (this.state.loading === true) return <ProgressLoading/>;
        if (this.state.error) return <div style={{width: '100%', textAlign: 'center', margin: '20px auto'}}><Typography variant='h2'>{this.state.error}</Typography></div>;
        const {rally} = this.state;

        return (
                <Paper elevation={0}>
                    <RallyBlock rally={rally} meeting={this.state.meeting} />

                    <Box component={"div"} p={3}>
                    {!rally.meetings ? '' :
                    (rally.meetings.length === 0)
                        ?
                        <span>No meetings yet. <u onClick={() => window.logUse.logEvent('rally-subscribe', {'id':this.props.match.params.rid})}>Subscribe</u> to help schedule one</span>
                        :
                            <React.Fragment>
                                <List component="nav" aria-label="rally meetings">
                                <ListSubheader>MEETINGS</ListSubheader>
                                {rally.meetings.map((r, i) => {
                                    return (<ListItem button  key={r.title + '-' + i} component={NavLink} to={`/rally/${rally.id}/meeting/${r.id}`} >
                                        <ListItemText primary={r.title} secondary={r.start_end_times?.date_start?.seconds
                                        ? moment(r.start_end_times?.date_start?.seconds * 1000).format('dddd, MMMM Do YYYY, h:mm a') : null} />
                                    </ListItem>)
                                })}
                                </List>
                            </React.Fragment>
                    }
                    </Box>
                </Paper>
        );
    }
}

export default withRouter(RallyHome);
