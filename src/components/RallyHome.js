import { connect } from 'react-redux';
import { entityData } from '../redux/entityDataReducer';
import React, { Component } from 'react';
import { withRouter } from 'react-router';
import Typography from "@material-ui/core/Typography";
import PlanList from './PlanList';
import ProgressLoading from "./ProgressLoading";
import Grid from "@material-ui/core/Grid";
import Avatar from "@material-ui/core/Avatar";
import AvatarGroup from "@material-ui/lab/AvatarGroup";
import {rallyStyles} from '../Util/ThemeUtils';
import {withStyles} from "@material-ui/core/styles";

class RallyHome extends Component {

    componentDidMount() {
        this.refresh();
    }

    componentDidUpdate(prevProps) {
        if (this.props.location.pathname !== prevProps.location.pathname || this.props.location.search !== prevProps.location.search) {
            this.refresh();
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
                                </video>
                                : <img alt={'libel'} src={this.props.entity.apiData.img} style={{width:'100%'}} />}

                        </Grid>
                        <Grid item style={{padding:8}} xs={12} sm={5} md={4} >
                            <Typography variant='h1' className={classes.title} color={'error'}>{this.props.entity.apiData.title}</Typography>
                            <Typography variant='h4' >{this.props.entity.apiData.start}</Typography>
                            <Typography variant='inherit' color={'inherit'} ><a href={this.props.entity.apiData.videolink} target={'_blank'} rel="noopener noreferrer">
                                {this.props.entity.apiData.videolink}</a>
                            </Typography>
                        </Grid>
                    </Grid>

                    <Grid container justify={'space-around'} style={{marginTop:20}}>
                        <Grid item>
                            <div>Moderator</div>
                            <Avatar alt={this.props.entity.apiData.moderators[0].name} src={this.props.entity.apiData.moderators[0].img} />
                        </Grid>

                        <Grid item>
                            <div>Speakers</div>
                            <AvatarGroup>
                                {this.props.entity.apiData.speakers.map(r => <Avatar key={r.img} alt={r.name} src={r.img} />)}
                                <Avatar alt="add" onClick={e => alert('TODO: Apply to speak')} >+</Avatar>
                            </AvatarGroup>
                        </Grid>

                    </Grid>

                    <PlanList classes={this.props.classes}
                              rallyData={this.props.entity.apiData} />

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
)(withRouter(withStyles(rallyStyles, {withTheme:true})(RallyHome)));
