import { normalizeRally} from '../redux/entityDataReducer';
import React, {Component} from 'react';
import {withRouter} from 'react-router';
import Typography from "@material-ui/core/Typography";
import ProgressLoading from "../components/ProgressLoading";
import RallyBlock from "../components/RallyBlock";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import {NavLink} from "react-router-dom";

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
            let rally = await normalizeRally(doc, ["author", "picture", "promo_video", "meetings", "research"]);
            let meeting = false;
            if (rally?.meetings.length > 0){
                // sort by start desc
                meeting = rally.meetings[0];
            }
            this.setState({rally:rally, meeting:meeting, loading:false, error:false})
        } else {
            this.setState({rally:false, loading:false, error:'invalid id'})
        }
    }

    render() {
        if (this.state.loading === true) return <ProgressLoading/>;
        if (this.state.error) return <div style={{width: '100%', textAlign: 'center', margin: '20px auto'}}><Typography variant='h2'>{this.state.error}</Typography></div>;
        const {rally} = this.state;

        return (
            <React.Fragment>
                <RallyBlock rally={rally} meeting={this.state.meeting} />

                <Box p={3}>
                {!rally.meetings ? '' :
                (rally.meetings.length === 0)
                    ?
                    <span>No meetings yet. <u onClick={() => window.logUse.logEvent('rally-subscribe', {'id':this.props.match.params.rid})}>Subscribe</u> to help schedule one</span>
                    :
                        <React.Fragment>
                            <Typography variant='subtitle1'>Meetings</Typography>
                            {rally.meetings.map((r, i) => {
                                return <Grid item key={r.title + '-' + i}>
                                    <Typography component={NavLink} to={`/rally/${rally.id}/meeting/${r.id}`} variant={'h4'}>{r.title}</Typography>
                                </Grid>
                            })}
                        </React.Fragment>
                }
                </Box>
            </React.Fragment>
        );
    }
}

export default withRouter(RallyHome);
