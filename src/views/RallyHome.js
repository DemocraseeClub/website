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
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

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
        // TODO: connect to Firebase DB (https://github.com/eliataylor/clock-agendas/issues/5)
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

                <Box p={3}>
                {!rally.meetings ? '' :
                (rally.meetings.length === 0)
                    ?
                    <span>No meetings yet. <u onClick={() =>  window.logUse.logEvent('rally-subscription', {'id':this.props.match.params.rid})}>Subscribe</u> to help schedule one</span>
                    :
                        <React.Fragment>
                            <Typography variant='subtitle1'>Meetings</Typography>
                            {rally.meetings.map(r => {
                                return <Grid item key={r.title}>
                                    <NavLink to={r.link}>
                                        <Typography variant={'h4'}>{r.title}</Typography>
                                    </NavLink>
                                </Grid>
                            })}
                            <Box mt={8} >
                                <NavLink to={'/rally/templates'}><Button variant={'contained'} disableElevation={true}>Host a meeting</Button></NavLink>
                            </Box>
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
