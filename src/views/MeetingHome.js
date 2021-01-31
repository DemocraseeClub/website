import { connect } from 'react-redux';
import { entityData } from '../redux/entityDataReducer';
import React, { Component } from 'react';
import { withRouter } from 'react-router';
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

class MeetingHome extends Component {

    constructor(p) {
        super(p);
        this.state = {editMode:false};
    }

    componentDidMount() {
        this.refresh();
    }

    componentDidUpdate(prevProps) {
        if (this.props.location.pathname !== prevProps.location.pathname || this.props.location.search !== prevProps.location.search) {
            this.refresh();
        } else if (!prevProps.entity.apiData && this.props.entity.apiData) {
            if (this.props.entity.apiData.hosts.length === 0) {
                this.setState({editMode:true})
            }
        }
    }

    refresh () {
        // var url = this.props.location.pathname;
        let url = '/json/' + this.props.match.params.rid + '/' + this.props.match.params.mid + '.json';
        return this.props.refreshEntity(url);
    }

    render() {
        const {classes} = this.props;

        if (this.props.entity.loading === true) return <ProgressLoading />;
        if (this.props.entity.error) return <div style={{width:'100%', textAlign:'center', margin:'20px auto'}}><Typography variant='h2'>{this.props.entity.error}</Typography></div>;
        if (!this.props.entity.apiData) return 'no results';

        return (
            <div className={classes.root}>
                    <RallyBlock rally={this.props.entity.apiData} />

                    <PlanList classes={this.props.classes}
                              dispatch={this.props.dispatch}
                              editMode={this.state.editMode}
                              rallyData={this.props.entity.apiData} />


                <Grid container justify={'space-between'} style={{padding:20}}>
                    <Button startIcon={<Create/>} variant={'contained'}
                            color={this.state.editMode ? 'primary' : 'secondary'}
                            onClick={e => this.setState({editMode: !this.state.editMode})}>Edit Meeting</Button>
                    <Button onClick={e => {
                        console.log(this.props.entity.apiData)
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
)(withRouter(withStyles(rallyStyles, {withTheme:true})(withSnackbar(MeetingHome))));
