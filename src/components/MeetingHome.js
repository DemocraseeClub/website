import { connect } from 'react-redux';
import { entityData } from '../redux/entityDataReducer';
import React, { Component } from 'react';
import { withRouter } from 'react-router';
import Typography from "@material-ui/core/Typography";
import PlanList from './PlanList';
import InsertPhoto from '@material-ui/icons/InsertPhoto';
import ProgressLoading from "./ProgressLoading";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Avatar from "@material-ui/core/Avatar";
import AvatarGroup from "@material-ui/lab/AvatarGroup";
import {rallyStyles} from '../Util/ThemeUtils';
import {withStyles} from "@material-ui/core/styles";
import Create from "@material-ui/icons/Create";
import ExportIcon from "@material-ui/icons/ImportExport";
import Button from "@material-ui/core/Button";
import {withSnackbar} from "notistack";

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
            if (this.props.entity.apiData.moderators.length === 0) {
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
                    <Grid container justify={'space-around'} alignContent={'center'} >
                        <Grid item xs={12} sm={7} md={8} >
                            {this.props.entity.apiData.videofile ?
                                <video style={{width:'100%'}} height="240" controls>
                                    <source src={this.props.entity.apiData.videofile} type="video/mp4" />
                                </video> :
                            (this.props.entity.apiData.img) ?
                                <img alt={this.props.entity.apiData.title} src={this.props.entity.apiData.img} style={{maxWidth:'100%'}} />
                            :
                                <Box p={2} ml={4}>
                                    <Button variant={'contained'} disableElevation={true} color={'secondary'} startIcon={<InsertPhoto />}>Cover Image</Button>
                                </Box>
                        }
                        </Grid>
                        <Grid item style={{padding:8}} xs={12} sm={5} md={4} >
                            <Typography variant='h1' className={classes.title} color={'error'}>{this.props.entity.apiData.title}</Typography>
                            <Typography variant='h4' >{this.props.entity.apiData.start === 'tomorrow' ? new Date(+new Date() + 86400000).toLocaleString()  : this.props.entity.apiData.start }</Typography>
                            <Typography variant='inherit' color={'inherit'} ><a href={this.props.entity.apiData.videolink} target={'_blank'} rel="noopener noreferrer">
                                {this.props.entity.apiData.videolink}</a>
                            </Typography>
                        </Grid>
                    </Grid>

                    <Grid container justify={'space-around'} style={{marginTop:20}}>
                        <Grid item>
                            <div>Moderator</div>
                            {this.props.entity.apiData.moderators.length > 0 ?
                                <Avatar alt={this.props.entity.apiData.moderators[0].name} src={this.props.entity.apiData.moderators[0].img} />
                                :
                                <Avatar alt="add" >+</Avatar>
                            }
                        </Grid>

                        <Grid item>
                            <div>Speakers</div>
                            <AvatarGroup>
                                {this.props.entity.apiData.speakers.map(r => <Avatar key={r.img} alt={r.name} src={r.img} />)}
                                <Avatar alt="add" onClick={e => alert('TODO: Apply to speak')} >+</Avatar>
                            </AvatarGroup>
                        </Grid>

                        <Grid item>
                            <Button startIcon={<Create />} fullWidth={true} variant={'contained'}
                                    color={this.state.editMode ? 'primary' : 'secondary'}
                                    onClick={e => this.setState({editMode:!this.state.editMode})} >Edit Mode</Button>
                        </Grid>

                    </Grid>

                    <PlanList classes={this.props.classes}
                              dispatch={this.props.dispatch}
                              editMode={this.state.editMode}
                              rallyData={this.props.entity.apiData} />


                    <div style={{marginTop:20, marginBottom:20, paddingLeft:25}}>
                        <Button onClick={e => {
                            console.log(this.props.entity.apiData)
                            this.props.enqueueSnackbar('For now, e-mail eli the JSON printed to your console in Developer Tools');
                        }} startIcon={<ExportIcon />} variant={'contained'} color={'info'} disableElevation={true} >Export Meeting</Button>
                    </div>

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
