import React from 'react';
import {withStyles, makeStyles} from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import SanitizedHTML from 'react-sanitized-html';

import PropTypes from 'prop-types';
import Check from '@material-ui/icons/CheckBox';
import PlayIcon from '@material-ui/icons/PlayCircleFilled';
import StopIcon from '@material-ui/icons/PauseCircleFilled';
import Unchecked from '@material-ui/icons/CheckBoxOutlineBlank';
import UnfoldMore from '@material-ui/icons/UnfoldMore';
import UnfoldLess from '@material-ui/icons/UnfoldLess';

import Avatar from '@material-ui/core/Avatar';
import AvatarGroup from '@material-ui/lab/AvatarGroup';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import TextField from '@material-ui/core/TextField';
import MediaRecorder from "./MediaRecorder";
import Config from '../Config';

import API from '../Util/API';
import {withRouter} from "react-router";

const useQontoStepIconStyles = makeStyles({
    root: {
        color: '#eaeaf0',
        display: 'flex',
        height: 22,
        alignItems: 'center',
    },
    active: {
        color: '#784af4',
    },
    circle: {
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: 'currentColor',
    },
    completed: {
        color: '#784af4',
        zIndex: 1,
        fontSize: 18,
    },
    timer: {
        fontSize:11,
        fontWeight:800,
        textAlign:'center',
        display:'block',
        textIndent:'-6px'
    }
});


function QontoStepIcon(props) {
    const classes = useQontoStepIconStyles();
    const { active, completed, countdown } = props;

    let color = active ? 'secondary' : 'primary';

    if (typeof countdown !== 'number') return <div className={classes.circle} />

    return (
            <div>
                {completed ?
                    <Check className={classes.completed} color={color} /> :
                    <Unchecked color={color} />
                }
                <span className={classes.timer}>{formatSeconds(countdown)}</span>
            </div>
    );
}

QontoStepIcon.propTypes = {
    /**
     * Whether this step is active.
     */
    active: PropTypes.bool,
    /**
     * Mark the step as completed. Is passed to child components.
     */
    completed: PropTypes.bool,
};


const formatSeconds = (sec, len) => {
    let date = new Date(null);
    date.setSeconds(sec); // specify value of SECONDS
    let time = date.toISOString().substr(11, 8);
    if (time.indexOf('01:00:00') === 0) return '60:00';
    if (time.indexOf('00:') === 0) time = time.substr('00:'.length);
    return time;
}

class PlanList extends React.Component {

    constructor(p) {
        super(p);
        this.state = {
            activeStep: -1,
            countRemains: 0,
            countScheduled: 0,
            countStep: 0,
            showAll: false,
            running: false,
            notes: {},
            videoOpen: false,
            rallyData: false
        }

        this.runTimers = this.runTimers.bind(this);
        this.stopTimers = this.stopTimers.bind(this);
    }

    componentDidMount() {
        if (this.props.match.params && this.props.match.params.rid && this.props.match.params.mid) {
            let path = '/json/' + this.props.match.params.rid + '/' + this.props.match.params.mid + '.json';
            API.Get(path).then(res => {
                this.setState({rallyData:res.data}, e => this.initCounter());
            }).catch(e => this.setState({rallyData:'invalid path'}))
        } else {
            this.setState({rallyData:'invalid path'});
        }
    }

    initCounter() {
        let total = 0;
        this.state.rallyData.lineItems.forEach(o => {
            total += o.seconds
            o.countdown = o.seconds;
        });
        this.setState({countRemains:total, countScheduled:total});
    }

    handleNext = () => {
        this.setState({activeStep:this.state.activeStep + 1});
    };

    handleBack = () => {
        this.setState({activeStep:this.state.activeStep - 1});
    };

    handleReset = () => {
        this.setState({activeStep:0});
    };

    runTimers(){
        console.log(this.state.activeStep);
        if (this.state.activeStep === -1) {
            this.setState({activeStep: 0 , running: true, videoOpen:true}, this.runTimers)
        } else if (this.state.running === false) {
            this.setState({running: true}, this.runTimers)
        } else {

            let totSec = this.state.countRemains - 1;
            if (totSec === 0) {
                this.stopTimers();
                return 'rally complete';
            }
            let curStep = this.state.rallyData.lineItems[this.state.activeStep];
            if (typeof curStep.countdown !== 'number') {
                curStep.countdown = curStep.seconds;
            } else {
                curStep.countdown = curStep.countdown - 1;
            }

            let st = {countRemains: totSec, countStep:curStep.countdown};
            if (curStep.countdown === 0) {
                st.activeStep = this.state.activeStep + 1;
            }
            this.setState(st)
            setTimeout(this.runTimers, 1000);
        }
    }

    stopTimers() {
        this.setState({running:false});
    }

    handleNote(val, index) {
        let notes = {...this.state.notes};
        notes[index] = val;
        console.log(notes);
        this.setState({notes:notes});
    }

    render() {
        const {classes} = this.props;
        const {activeStep} = this.state;
        let nesting = {};

        if (!this.state.rallyData) return 'loading agenda...'
        else if (typeof this.state.rallyData === 'string') return this.state.rallyData;

        return (
            <div className={classes.root}>

                <AppBar position={'sticky'}>
                    <Toolbar>
                        <div style={{display:'flex', justifyContent:'space-between', alignContent:'center', width:'100%'}}>
                            <div>
                                <Typography variant='h6' >Agenda Clock</Typography>
                            </div>

                            <Typography variant='h6' >
                                <Typography variant='inherit' color={'error'}> {formatSeconds(this.state.countRemains)} </Typography>
                                /
                                <Typography variant='inherit' > {formatSeconds(this.state.countScheduled)}</Typography>
                            </Typography>

                            {this.state.running === true ?
                                <Button variant={'contained'} color={'secondary'} onClick={this.stopTimers} startIcon={<StopIcon />}>Pause</Button>
                                :
                                <Button variant={'contained'} color={'secondary'} onClick={this.runTimers} startIcon={<PlayIcon />}>Start Clock</Button>
                            }

                        </div>
                    </Toolbar>
                </AppBar>
                { this.state.videoOpen === true ? <div style={{position:'absolute', width:'100%', right:0}}> <MediaRecorder /></div> : null}


                <div style={{marginTop:100, textAlign:'left'}}>

                    <Grid container justify={'space-around'} alignContent={'center'} >
                        <Grid item xs={12} sm={7} md={8} >
                            {this.state.rallyData.videofile ?
                                <video style={{width:'100%'}} height="240" controls>
                                    <source src={this.state.rallyData.videofile} type="video/mp4" />
                                </video>
                            : <img alt={'libel'} src={this.state.rallyData.img} style={{width:'100%'}} />}

                        </Grid>
                        <Grid item style={{padding:8}} xs={12} sm={5} md={4} >
                            <Typography variant='h1' className={classes.title} color={'error'}>{this.state.rallyData.title}</Typography>
                            <Typography variant='h4' >{this.state.rallyData.start}</Typography>
                            <Typography variant='inherit' color={'inherit'} ><a href={this.state.rallyData.videolink} target={'_blank'} rel="noopener noreferrer">
                                {this.state.rallyData.videolink}</a>
                            </Typography>
                        </Grid>
                    </Grid>


                    <Grid container justify={'space-around'} style={{marginTop:20}}>
                        {this.state.showAll === true ?
                            <Button style={{alignSelf:'center'}} startIcon={<UnfoldLess />} variant='contained' color={'secondary'} onClick={e => this.setState({showAll:!this.state.showAll})}>Close All</Button>
                            :
                            <Button style={{alignSelf:'center'}} startIcon={<UnfoldMore />}  variant='contained' color={'secondary'} onClick={e => this.setState({showAll:!this.state.showAll})}>Open All</Button>
                        }


                        <Grid item>
                            <div>Moderator</div>
                            <Avatar alt={this.state.rallyData.moderators[0].name} src={this.state.rallyData.moderators[0].img} />
                        </Grid>

                        <Grid item>
                            <div>Speakers</div>
                            <AvatarGroup>
                                {this.state.rallyData.speakers.map(r => <Avatar alt={r.name} src={r.img} />)}
                                <Avatar alt="add" onClick={e => alert('TODO: Apply to speak')} >+</Avatar>
                            </AvatarGroup>
                        </Grid>

                    </Grid>

                    <Stepper activeStep={activeStep} orientation="vertical" >
                    {this.state.rallyData.lineItems.map((curItem, index) => {
                        let padLeft = 30; // curItem.nest.length *
                            let parent = curItem.nest[curItem.nest.length - 1];
                            if (typeof nesting[parent] === 'undefined') {
                                nesting[parent] = true;
                                parent = <div className={classes.stepSection} ><Typography variant='h3' className={classes.topLevelLabel} >{parent}</Typography></div>;
                            } else {
                                parent = null;
                            }
                            return (
                                    <Step key={'step-' + index} active={this.state.showAll === true || activeStep === index ? true : undefined}>
                                        {parent}
                                        <StepLabel className={classes.stepTimeBlock}
                                                   StepIconComponent={QontoStepIcon}
                                                   StepIconProps={curItem}>
                                                <Typography className={classes.stepLabel} variant={'h5'}>{curItem.title}</Typography>
                                        </StepLabel>
                                        <StepContent className={classes.stepContent}>
                                            <div >
                                                <Grid container justify={'space-between'} >
                                                    <Grid item xs={12} sm={6} style={{fontSize:20}}>
                                                        {curItem.desc ? <Typography variant={'h5'}>{curItem.desc}</Typography> : null}
                                                        {curItem.html ?
                                                            <SanitizedHTML allowedTags={Config.allowedTags}
                                                                   allowedAttributes={Config.allowedAttributes}
                                                                   html={curItem.html}/> : null}
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <TextField
                                                            label="Notes"
                                                            multiline
                                                            style={{width:'100%'}}
                                                            variant={'outlined'}
                                                            rows={3}
                                                            value={this.state.notes[index]}
                                                            onChange={e => this.handleNote(e.currentTarget.value, index)}
                                                        />
                                                        {
                                                            (activeStep === index) ?
                                                                    <div className={classes.actionsContainer} >
                                                                        {activeStep > 0 ?
                                                                            <Button size="small" onClick={this.handleBack} className={classes.button}>
                                                                                Back
                                                                            </Button> : null
                                                                        }

                                                                        <Button
                                                                            variant="outlined"
                                                                            color="primary"
                                                                            size="small"
                                                                            endIcon={<Check />}
                                                                            onClick={this.handleNext}
                                                                            className={classes.button}
                                                                        >
                                                                            {activeStep === this.state.rallyData.lineItems.length - 1 ? 'Finish' : 'Done'}
                                                                        </Button>
                                                                    </div> : null
                                                        }
                                                    </Grid>
                                                </Grid>
                                            </div>
                                        </StepContent>
                                    </Step>

                            );
                        }
                    )}
                </Stepper>

                {activeStep === this.state.rallyData.lineItems.length && (
                    <Paper square elevation={0} className={classes.resetContainer}>
                        <Typography>All steps completed - you&apos;re finished</Typography>
                        <Button onClick={this.handleReset} className={classes.button}>
                            Reset
                        </Button>
                        <Button onClick={this.handleSubmit} className={classes.button}>
                            Handle Submit
                        </Button>
                    </Paper>
                )}

                </div>
            </div>
        );
    }

}


const useStyles = theme => ({
    root: {
        width: '100%',
    },
    title : {
        fontSize:46,
        fontWeight:100
    },
    button: {
        marginTop: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
    actionsContainer: {
        textAlign:'left',
        marginTop: theme.spacing(2),
    },
    resetContainer: {
        padding: theme.spacing(3),
    },
    stepSection: {
        paddingLeft:50
    },
    stepTimeBlock : {
        fontSize:19,
    },
    stepLabel : {
        fontSize:19,
        paddingLeft:20,
        fontWeight:700,
    },
    stepContent : {
        paddingLeft:45,
        paddingBottom:10,
        borderBottom:'1px solid #ccc'
    },
    topLevelLabel : {
        backgroundColor:theme.palette.primary.main,
        color:theme.palette.primary.contrastText,
        textAlign:'left',
        padding:10,
        fontSize:26,
        fontWeight:900,
        borderRadius:'5px 5px 0 5px'
    }
});

export default withStyles(useStyles, {withTheme:true})(withRouter(PlanList));
