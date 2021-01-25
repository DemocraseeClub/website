import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import Check from '@material-ui/icons/CheckBox';
import PlayIcon from '@material-ui/icons/PlayCircleFilled';
import StopIcon from '@material-ui/icons/PauseCircleFilled';
import Unchecked from '@material-ui/icons/CheckBoxOutlineBlank';
import UnfoldMore from '@material-ui/icons/UnfoldMore';
import UnfoldLess from '@material-ui/icons/UnfoldLess';
import VideoCall from '@material-ui/icons/VideoCall';
import VideoCamOff from '@material-ui/icons/VideocamOff';
import {withSnackbar} from 'notistack';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import MediaRecorder from "./MediaRecorder";
import {countDown} from "../redux/entityDataReducer";
import AgendaItem from "./AgendaItem";

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
        fontSize: 11,
        fontWeight: 800,
        textAlign: 'center',
        display: 'block',
        textIndent: '-6px'
    }
});

function QontoStepIcon(props) {
    const classes = useQontoStepIconStyles();
    const {status, countdown} = props;

    let color = status === 'active' ? 'secondary' : 'primary';

    if (typeof countdown !== 'number') return <div className={classes.circle}/>

    return (
        <div>
            {status === 'completed' ? <Check className={classes.completed} color={color}/> : <Unchecked color={color}/>}
            <span className={classes.timer}>{formatSeconds(countdown)}</span>
        </div>
    );
}

QontoStepIcon.propTypes = {
    status: PropTypes.string,
    active: PropTypes.bool,
    completed: PropTypes.bool,
};

QontoStepIcon.defaultProps = {
    status: "inactive",
    active: false,
    completed: false
}

const formatSeconds = (sec, len) => {
    if (!Number(sec)) sec = 0;
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
            showAll: false,
            running: false,
            headers: [],
            videoOpen: false,
            rallyData: p.rallyData || false
        }

        this.runTimers = this.runTimers.bind(this);
        this.stopTimers = this.stopTimers.bind(this);
    }

    handleNext = () => {
        this.setState({activeStep: this.state.activeStep + 1});
    };

    handleBack = () => {
        this.setState({activeStep: this.state.activeStep - 1});
    };

    handleReset = () => {
        this.setState({activeStep: 0});
    };

    runTimers() {
        if (this.state.activeStep === -1) {
            this.setState({activeStep: 0, running: true}, this.runTimers)
        } else if (this.state.running === false) {
            this.setState({running: true}, this.runTimers)
        } else {
            if (this.props.rallyData.countRemains === 0) {
                this.stopTimers();
                return 'rally complete';
            }
            if (this.state.activeStep < this.props.rallyData.lineItems.length - 1) {
                if (this.props.rallyData.lineItems[this.state.activeStep].countdown === 0) {
                    this.handleNext();
                }
            }

            setTimeout(() => {
                if (this.state.running === false) {
                    return false;
                }
                this.props.dispatch(countDown(this.state.activeStep));
                this.runTimers();
            }, 1000);
        }
    }

    stopTimers() {
        this.setState({running: false});
    }

    render() {
        if (!this.props.rallyData || !this.props.rallyData.headers) return 'loading agenda...'

        const {classes} = this.props;
        const {activeStep} = this.state;
        let nesting = {};

        return (
            <div className={classes.root} style={{marginTop: 20, textAlign: 'left'}}>

                <AppBar position={'sticky'}>
                    <Toolbar>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignContent: 'center',
                            width: '100%'
                        }}>
                            <Typography variant='h6'>Meeting Time</Typography>
                            <Typography variant='h6'>
                                <Typography variant='inherit'
                                            color={'error'}> {formatSeconds(this.props.rallyData.countRemains)} </Typography>
                                /
                                <Typography
                                    variant='inherit'> {formatSeconds(this.props.rallyData.countScheduled)}</Typography>
                            </Typography>

                            {this.state.showAll === true ?
                                <Button style={{alignSelf: 'center'}} startIcon={<UnfoldLess/>} variant='contained'
                                        color={'secondary'}
                                        onClick={e => this.setState({showAll: !this.state.showAll})}>Close All</Button>
                                :
                                <Button style={{alignSelf: 'center'}} startIcon={<UnfoldMore/>} variant='contained'
                                        color={'secondary'}
                                        onClick={e => this.setState({showAll: !this.state.showAll})}>Read All</Button>
                            }

                            {this.state.videoOpen === false ?
                                <Button style={{alignSelf: 'center'}} startIcon={<VideoCall/>} variant='contained'
                                        color={'secondary'}
                                        onClick={e => this.setState({videoOpen: !this.state.videoOpen})}>Video
                                    Recorder</Button>
                                :
                                <Button style={{alignSelf: 'center'}} startIcon={<VideoCamOff/>} variant='contained'
                                        color={'secondary'}
                                        onClick={e => this.setState({videoOpen: !this.state.videoOpen})}>Hide
                                    Recorder</Button>
                            }

                            {this.state.running === true ?
                                <Button variant={'contained'} color={'secondary'} onClick={this.stopTimers}
                                        startIcon={<StopIcon/>}>Pause</Button>
                                :
                                <Button variant={'contained'} color={'secondary'} onClick={this.runTimers}
                                        startIcon={<PlayIcon/>}>Start Clock</Button>
                            }

                        </div>
                    </Toolbar>
                </AppBar>

                {this.state.videoOpen === true ?
                    <div style={{position: 'absolute', width: '100%', right: 0}}><MediaRecorder/></div> : null}

                <div className='agendaList'>
                    <Stepper activeStep={activeStep} orientation="vertical" style={{padding:'24px 14px 24px 14px'}}>
                        {this.props.rallyData.lineItems.map((curItem, index) => {
                            let header = null;
                            if (curItem.nest.length > 0) {
                                if (typeof nesting[curItem.nest] === 'undefined') {
                                    nesting[curItem.nest] = true;
                                    header = this.props.rallyData.headers.find(h => h.label === curItem.nest);
                                    if (header) {
                                        header = <div className={classes.stepSection}><Typography variant='h3'
                                                                                                  className={classes.topLevelLabel}>{curItem.nest}</Typography>
                                        </div>
                                    }
                                }
                            }
                            return <AgendaItem
                                    forceShow={this.state.showAll}
                                    activeStep={activeStep}
                                    key={'ai' + index}
                                    curItem={curItem} index={index} classes={classes} header={header}
                                    editMode={this.props.editMode}
                                    dispatch={this.props.dispatch}
                                    handleBack={this.handleBack}
                                    handleNext={this.handleNext}
                                />
                        })}
                    </Stepper>

                    {activeStep === this.props.rallyData.lineItems.length && (
                        <Paper square elevation={0} className={classes.resetContainer}>
                            <Button onClick={this.handleReset} className={classes.button}>
                                Reset Clock
                            </Button>
                        </Paper>
                    )}
                </div>
            </div>
        );
    }

}


export default withSnackbar(PlanList);
