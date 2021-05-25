import {connect} from 'react-redux';
import {fbRally} from '../redux/entityDataReducer';
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
        this.state = {editMode: false};
    }

    componentDidMount() {
        this.refresh();
    }

    componentDidUpdate(prevProps) {
        if (this.props.location.pathname !== prevProps.location.pathname || this.props.location.search !== prevProps.location.search) {
            this.refresh();
        }
    }

    refresh() {
        this.props.dispatch(fbRally(this.props.match.params.rid))
    }

    render() {
        if (this.props.entity.loading === true) return <ProgressLoading/>;
        if (this.props.entity.error) return <div style={{width: '100%', textAlign: 'center', margin: '20px auto'}}><Typography variant='h2'>{this.props.entity.error}</Typography></div>;
        if (!this.props.entity.apiData) return 'no results';
        const rally = this.props.entity.apiData;

        return (
            <React.Fragment>
                <RallyBlock rally={rally} />

                <Box p={3}>
                {!rally.meetings ? '' :
                (rally.meetings.length === 0)
                    ?
                    <span>No meetings yet. <u onClick={() =>  window.logUse.logEvent('rally-subscribe', {'id':this.props.match.params.rid})}>Subscribe</u> to help schedule one</span>
                    :
                        <React.Fragment>
                            <Typography variant='subtitle1'>Meetings</Typography>
                            {rally.meetings.map((r, i) => {
                                return <Grid item key={r.title + '-' + i}>
                                    <NavLink to={`/rally/${rally.id}/meeting/${r.id}`}>
                                        <Typography variant={'h4'}>{r.title}</Typography>
                                    </NavLink>
                                </Grid>
                            })}
                        </React.Fragment>
                }
                </Box>
            </React.Fragment>
        );
    }


}

const mapStateToProps = (state) => {
    const newState = {me: state.auth.me};
    newState.entity = state.entity;
    newState.location = state.router.location;
    return newState;
};

export default connect(mapStateToProps, null)(withRouter(RallyHome));
