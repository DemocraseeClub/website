import React, {Component} from 'react';
import {withRouter} from 'react-router';
import Typography from "@material-ui/core/Typography";
import PlanList from '../components/PlanList';
import ProgressLoading from "../components/ProgressLoading";
import {rallyStyles} from '../Util/ThemeUtils';
import {withStyles} from "@material-ui/core/styles";
import ExportIcon from "@material-ui/icons/ImportExport";
import Button from "@material-ui/core/Button";
import {withSnackbar} from "notistack";
import RallyBlock from "../components/RallyBlock";
import Create from "@material-ui/icons/Create";
import Grid from "@material-ui/core/Grid";
import {connect} from 'react-redux';
import {
    entityDataFailure,
    entityDataStarted,
    entityDataSuccess,
    initCounter, normalizeMeeting,
    normalizeRally
} from "../redux/entityDataReducer";

class MeetingHome extends Component {

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

    async refresh() {
        this.props.dispatch(entityDataStarted(this.props.location.pathname));
        const rallyRef = window.fireDB.collection("rallies").doc(this.props.match.params.rid)
        let doc = await rallyRef.get();
        if (doc.exists) {
            let rally = await normalizeRally(doc, 0); // NOTE: deeper query

            let meeting = false;
            const meetRef = rallyRef.collection('meetings').doc(this.props.match.params.mid)
            doc = await meetRef.get();
            if (doc.exists) {
                meeting = await normalizeMeeting(doc, 3);
            };

            this.props.dispatch(entityDataSuccess(rally, meeting));
            this.props.dispatch(initCounter());
        } else {
            this.props.dispatch(entityDataFailure('invalid rally id'));
        }
    }

    render() {
        const {classes} = this.props;

        if (this.props.entity.loading === true) return <ProgressLoading />;
        if (this.props.entity.error) return <div style={{width:'100%', textAlign:'center', margin:'20px auto'}}><Typography variant='h2'>{this.props.entity.error}</Typography></div>;
        if (!this.props.entity.rally) return 'no rally';

        return (
            <div className={classes.root}>
                    <RallyBlock rally={this.props.entity.rally} />

                    <PlanList classes={this.props.classes}
                              dispatch={this.props.dispatch}
                              editMode={this.state.editMode}
                              rally={this.props.entity.rally}
                              meeting={this.props.entity.meeting} />

                <Grid container justify={'space-between'} style={{padding:20}}>
                    <Button startIcon={<Create/>} variant={'contained'}
                            color={this.state.editMode ? 'primary' : 'secondary'}
                            onClick={e => this.setState({editMode: !this.state.editMode})}>Edit Meeting</Button>
                    <Button onClick={e => {
                        console.log(this.props.entity.meeting)
                        this.props.enqueueSnackbar('For now, e-mail eli the JSON printed to your console in Developer Tools');
                    }} startIcon={<ExportIcon />} variant={'contained'} disableElevation={true} >Export Meeting</Button>
                </Grid>

            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const newState = {me:state.auth.me};
    newState.entity = state.entity;
    newState.location = state.router.location;
    return newState;
};

export default connect(
    mapStateToProps,
    null
)(withRouter(withStyles(rallyStyles, {withTheme:true})(withSnackbar(MeetingHome))));
