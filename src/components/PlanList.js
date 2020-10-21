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


const Config = {
    api: {
        base: process.env.REACT_APP_API_URL, // set in .env
        client : process.env.NODE_ENV === 'production' ?  'https://clock.taylormadetraffic.com/index.html' : '//localhost:3000'
    },
    allowedTags: ['blockquote', 'p', 'ul', 'li', 'ol', 'dl', 'dd', 'dt', // https://www.npmjs.com/package/sanitize-html
        'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
        'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'h2', 'h3', 'h4', 'h5', 'h6',
        'sup', 'sub', 'center', 'button'],
    allowedAttributes: {
        'a': ['href'],
        '*': ['id', 'style', 'data-toggle', 'data-target', 'aria-label', 'role', 'class'],
        'img': ['src', 'height', 'width']
    },
};

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
    if (time.indexOf('00:') === 0) time = time.substr('00:'.length);
    return time;
}

class PlanList extends React.Component {

    constructor(p) {
        super(p);
        this.state = {
            activeStep : -1,
            countRemains : 0,
            countScheduled:0,
            countStep : 0,
            showAll:false,
            running:false
        }
        this.runTimers = this.runTimers.bind(this);
        this.stopTimers = this.stopTimers.bind(this);
    }

    componentDidMount() {
        let total = 0;
        this.props.rallyData.lineItems.forEach(o => {
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
            this.setState({activeStep: 0 , running: true}, this.runTimers)
        } else if (this.state.running === false) {
            this.setState({running: true}, this.runTimers)
        } else {

            let totSec = this.state.countRemains - 1;
            if (totSec === 0) {
                this.stopTimers();
                return 'rally complete';
            }
            let curStep = this.props.rallyData.lineItems[this.state.activeStep];
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

    render() {
        const {classes} = this.props;
        const {activeStep} = this.state;
        let nesting = {};

        return (
            <div className={classes.root}>

                <AppBar>
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

                <div style={{marginTop:100, textAlign:'left', paddingLeft:10}}>

                    <Grid container justify={'space-between'} alignContent={'center'} wrap='nowrap'>
                        <Grid item>
                            <img alt={'libel'} src={this.props.rallyData.img} style={{width:'100%', minWidth:160}} />
                        </Grid>
                        <Grid item style={{padding:8}}>
                            <Typography variant='h1' color={'error'}>{this.props.rallyData.title}</Typography>
                            <Typography variant='h4' >{this.props.rallyData.start}</Typography>
                            <Typography variant='inherit' color={'inherit'} ><a href={this.props.rallyData.videolink} target={'_blank'} rel="noopener noreferrer">
                                {this.props.rallyData.videolink}</a>
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
                            <Avatar alt="Eli" src="https://democrasee.club/wp-content/uploads/bb-plugin/cache/Screen-Shot-2020-10-11-at-1.18.18-PM-circle.png" />
                        </Grid>

                        <Grid item>
                            <div>Speakers</div>
                            <AvatarGroup>
                                <Avatar alt="Indy" src="https://democrasee.club/wp-content/uploads/bb-plugin/cache/Screen-Shot-2020-10-11-at-1.18.06-PM-circle.png" />
                                <Avatar alt="Polina" src="https://democrasee.club/wp-content/uploads/bb-plugin/cache/Screen-Shot-2020-10-11-at-1.18.39-PM-circle.png" />
                                <Avatar alt="Marcela" src="https://democrasee.club/wp-content/uploads/bb-plugin/cache/Screen-Shot-2020-10-11-at-1.18.29-PM-circle.png" />
                                <Avatar alt="add" onClick={e => alert('TODO: Apply to speak')} >+</Avatar>
                            </AvatarGroup>
                        </Grid>

                    </Grid>

                    <Stepper activeStep={activeStep} orientation="vertical" >
                    {this.props.rallyData.lineItems.map((curItem, index) => {
                        let padLeft = curItem.nest.length * 30;
                            let parent = curItem.nest[curItem.nest.length - 1];
                            if (typeof nesting[parent] === 'undefined') {
                                nesting[parent] = true;
                                parent = <div style={{paddingLeft:padLeft + 15}} ><Typography variant='h5' className={classes.topLevelLabel} >{parent}</Typography></div>;
                            } else {
                                parent = null;
                            }
                            return (
                                    <Step key={'step-' + index} active={this.state.showAll === true || activeStep === index}>
                                        {parent}
                                        <StepLabel className={classes.stepLabel}
                                                   StepIconComponent={QontoStepIcon}
                                                   StepIconProps={curItem}>

                                            <div style={{paddingLeft:padLeft}}>
                                                <SanitizedHTML allowedTags={Config.allowedTags}
                                                               allowedAttributes={Config.allowedAttributes}
                                                               html={curItem.title} />
                                            </div>
                                        </StepLabel>
                                        <StepContent className={classes.stepContent}>
                                            <div style={{paddingLeft:padLeft + 15}}>
                                                {curItem.html ?
                                                    <SanitizedHTML allowedTags={Config.allowedTags}
                                                                   allowedAttributes={Config.allowedAttributes}
                                                                   html={curItem.html}/> :
                                                    curItem.subtitle
                                                }
                                            </div>
                                            {
                                                (activeStep === index) ?
                                                    <div className={classes.actionsContainer} style={{paddingLeft:padLeft + 15}}>
                                                        <div>
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
                                                        </div>
                                                    </div> : null
                                            }

                                        </StepContent>
                                    </Step>

                            );
                        }
                    )}
                </Stepper>

                {activeStep === this.props.rallyData.lineItems.length && (
                    <Paper square elevation={0} className={classes.resetContainer}>
                        <Typography>All steps completed - you&apos;re finished</Typography>
                        <Button onClick={this.handleReset} className={classes.button}>
                            Reset
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
    stepLabel : {
        textAlign:'left'
    },
    stepContent : {
        textAlign:'left'
    },
    topLevelLabel : {
        backgroundColor:theme.palette.primary.main,
        color:theme.palette.primary.contrastText,
        textAlign:'right',
        padding:8,
        fontWeight:900,
        borderRadius:'5px 5px 0 5px'
    }
});

export default withStyles(useStyles, {withTheme:true})(PlanList);;
