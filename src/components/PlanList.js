import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
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
import VideoCall from '@material-ui/icons/VideoCall';
import VideoCamOff from '@material-ui/icons/VideocamOff';
import { withSnackbar } from 'notistack';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import MediaRecorder from "./MediaRecorder";
import Config from '../Config';

import AgendaItemForm from "./AgendaItemForm";
import AgendaHeader from "./AgendaHeader";
import ExportIcon from "@material-ui/icons/ImportExport";
import HtmlEditor from "./HtmlEditor";

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
    const { status, countdown } = props;

    let color = status === 'active' ? 'secondary' : 'primary';

    if (typeof countdown !== 'number') return <div className={classes.circle} />

    return (
            <div>
                {status === 'completed' ?
                    <Check className={classes.completed} color={color} /> :
                    <Unchecked color={color} />
                }
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
    status : "inactive",
    active:false,
    completed : false
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
            headers:[],
            notes: {},
            videoOpen: false,
            rallyData: p.rallyData || false
        }

        this.runTimers = this.runTimers.bind(this);
        this.stopTimers = this.stopTimers.bind(this);
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
        if (this.state.activeStep === -1) {
            this.setState({activeStep: 0 , running: true}, this.runTimers)
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

            setTimeout(this.runTimers, 1000);
        }
    }

    stopTimers() {
        this.setState({running:false});
    }

    handleNote(val, index) {
        let notes = {...this.state.notes};
        notes[index] = val;
        this.setState({notes:notes});
    }

    renderOutline(outline, indent) {
        if (typeof outline === 'string') { return outline; }

        return outline.map((v, i) => {
            if (typeof v === 'string') {
                let liStyle = {paddingLeft:30 * indent, display:'list-item', listStylePosition:'inside' }
                liStyle.listStyleType = indent % 2 === 0 ? 'disc' : Math.floor(indent/2) % 2 === 0 ? 'circle' : 'square';

                /*
                const regex = /^\[([\w\s\d]+)\]\(((?:\/|https?:\/\/)[\w\d./?=#]+)\)$/
                const matches = v.match(regex);

                const singleMatch = /\[([^\[]+)\]\((.*)\)/
                for (var i = 0; i < matches.length; i++) {
                    var text = singleMatch.exec(matches[i])
                    console.log(`Match #${i}:`, text)
                    console.log(`Word  #${i}: ${text[1]}`)
                    console.log(`Link  #${i}: ${text[2]}`)
                }

                 */

                return <div style={liStyle} key={indent+'x'+i}>{v}</div>
            } else {
                return this.renderOutline(v, indent+1);
            }
        })
    }

    render() {
        if (!this.props.rallyData || !this.props.rallyData.headers) return 'loading agenda...'

        const {classes} = this.props;
        const {activeStep} = this.state;
        let nesting = {};

        return (
            <div className={classes.root} style={{marginTop:20, textAlign:'left'}}>

                <AppBar position={'sticky'}>
                    <Toolbar>
                        <div style={{display:'flex', justifyContent:'space-between', alignContent:'center', width:'100%'}}>
                            <div>
                                <Typography variant='h6' >Agenda Clock</Typography>
                            </div>

                            <Typography variant='h6' >
                                <Typography variant='inherit' color={'error'}> {formatSeconds(this.props.rallyData.countRemains)} </Typography>
                                /
                                <Typography variant='inherit' > {formatSeconds(this.props.rallyData.countScheduled)}</Typography>
                            </Typography>

                            {this.state.showAll === true ?
                                <Button style={{alignSelf:'center'}} startIcon={<UnfoldLess />} variant='contained' color={'secondary'} onClick={e => this.setState({showAll:!this.state.showAll})}>Close All</Button>
                                :
                                <Button style={{alignSelf:'center'}} startIcon={<UnfoldMore />}  variant='contained' color={'secondary'} onClick={e => this.setState({showAll:!this.state.showAll})}>Read All</Button>
                            }

                            {this.state.videoOpen === false ?
                                <Button style={{alignSelf:'center'}} startIcon={<VideoCall />} variant='contained' color={'secondary'} onClick={e => this.setState({videoOpen:!this.state.videoOpen})}>Video Recorder</Button>
                                :
                                <Button style={{alignSelf:'center'}} startIcon={<VideoCamOff />}  variant='contained' color={'secondary'} onClick={e => this.setState({videoOpen:!this.state.videoOpen})}>Hide Recorder</Button>
                            }

                            {this.state.running === true ?
                                <Button variant={'contained'} color={'secondary'} onClick={this.stopTimers} startIcon={<StopIcon />}>Pause</Button>
                                :
                                <Button variant={'contained'} color={'secondary'} onClick={this.runTimers} startIcon={<PlayIcon />}>Start Clock</Button>
                            }

                        </div>
                    </Toolbar>
                </AppBar>

                { this.state.videoOpen === true ? <div style={{position:'absolute', width:'100%', right:0}}> <MediaRecorder /></div> : null}

                <div className='agendaList'>
                    <Stepper activeStep={activeStep} orientation="vertical" >
                    {this.props.rallyData.lineItems.map((curItem, index) => {
                            let parent = null;
                            if (curItem.nest.length > 0) {
                                if (typeof nesting[curItem.nest] === 'undefined') {
                                    nesting[curItem.nest] = true;
                                    let header = this.props.rallyData.headers.find(h => h.label === curItem.nest);
                                    if (header) {
                                        parent = <AgendaHeader editMode={this.props.editMode} header={header} classes={classes} />;
                                    }
                                }
                            }
                            return (
                                    <Step key={'step-' + index}
                                        active={this.state.showAll === true || activeStep === index ? true : undefined}>

                                        {parent}
                                        <StepLabel className={classes.stepTimeBlock}
                                                   StepIconComponent={QontoStepIcon}
                                                   StepIconProps={curItem}>
                                            <div className={classes.stepLabel} >
                                                <Typography className={classes.stepLabelText} variant={'h5'}>
                                                    {curItem.title}</Typography>

                                                {this.props.editMode === true
                                                    ?
                                                    <AgendaItemForm item={curItem}
                                                                    index={index}
                                                                    headers={this.props.rallyData.headers} classes={classes} dispatch={this.props.dispatch} />
                                                                    :
                                                    null
                                                }

                                            </div>

                                        </StepLabel>
                                        <StepContent className={classes.stepContent}>
                                                <Grid container justify={'space-between'} spacing={1} >
                                                    <Grid item xs={12} sm={7} style={{fontSize:20}}>
                                                        {curItem.html ?
                                                            <SanitizedHTML allowedTags={Config.allowedTags}
                                                                   allowedAttributes={Config.allowedAttributes}
                                                                   html={curItem.html}/> : null}

                                                    {
                                                        (curItem.outline) ?
                                                        this.renderOutline(curItem.outline, 0) : null
                                                    }
                                                    </Grid>
                                                    <Grid item xs={12} sm={5} >

                                                        <HtmlEditor
                                                            label="Notes"
                                                            toolbar={'static'}
                                                            style={{width:'100%'}}
                                                            variant={'outlined'}
                                                            rows={3}
                                                            onChange={val => this.handleNote(val, index)}
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
                                                                            {activeStep === this.props.rallyData.lineItems.length - 1 ? 'Finish' : 'Done'}
                                                                        </Button>
                                                                    </div> : null
                                                        }
                                                    </Grid>
                                                </Grid>
                                        </StepContent>
                                    </Step>

                            );
                        }
                    )}
                </Stepper>

                {activeStep === this.props.rallyData.lineItems.length && (
                    <Paper square elevation={0} className={classes.resetContainer}>
                        <Button onClick={this.handleReset} className={classes.button}>
                            Reset Clock
                        </Button>
                    </Paper>
                )}

                </div>

                <div style={{marginTop:40}}>
                    <Button onClick={e => {
                        console.log(this.state.notes);
                        this.props.enqueueSnackbar('Copy from your console in Developer Tools');
                    }} startIcon={<ExportIcon />} fullWidth={true} variant={'outlined'} >Export Notes</Button>
                </div>

            </div>
        );
    }

}


export default withSnackbar(PlanList);
