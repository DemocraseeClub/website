import {connect} from 'react-redux';
import {entityData} from '../redux/entityDataReducer';
import React, {Component} from 'react';
import {withRouter} from 'react-router';
import Typography from "@material-ui/core/Typography";
import ProgressLoading from "../components/ProgressLoading";
import {rallyStyles} from '../Util/ThemeUtils';
import {withStyles} from "@material-ui/core/styles";
import RallyBlock from "../components/RallyBlock";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
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
        // var url = this.props.location.pathname;
        let url = '/json/' + this.props.match.params.rid + '/index.json';
        console.log(url);
        return this.props.refreshEntity(url);
    }

    render() {
        if (this.props.entity.loading === true) return <ProgressLoading/>;
        if (this.props.entity.error) return <div style={{width: '100%', textAlign: 'center', margin: '20px auto'}}><Typography variant='h2'>{this.props.entity.error}</Typography></div>;
        if (!this.props.entity.apiData) return 'no results';
        const rally = this.props.entity.apiData;

        return (
            <React.Fragment>
                <RallyBlock rally={this.props.entity.apiData} />
                {!rally.meetings ? '' :
                (rally.meetings.length === 0)
                    ?
                    'No meetings yet. Create one'
                    :
                    <Box p={3}>
                        <Typography variant='subtitle1'>Meetings</Typography>
                        {rally.meetings.map(r => {
                            return <Grid item key={r.title}>
                                <NavLink to={r.link}>
                                    <Typography variant={'h4'}>{r.title}</Typography>
                                </NavLink>
                            </Grid>
                        })}
                        <Box mt={8}>
                            <NavLink to={'/rally/templates'}><Button variant={'contained'} disableElevation={true}>Host a meeting</Button></NavLink>
                        </Box>
                    </Box>
                }
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

const mapDispatchToProps = dispatch => {
    return {
        refreshEntity: url => {
            dispatch(entityData(url));
        },
        dispatch
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withRouter(withStyles(rallyStyles, {withTheme: true})(RallyHome)));
