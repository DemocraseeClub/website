import React from 'react';
import Stepper from '@material-ui/core/Stepper';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Drawer from '@material-ui/core/Drawer';
import MenuIcon from '@material-ui/icons/Menu';
import Typography from '@material-ui/core/Typography';
import StopIcon from '@material-ui/icons/PauseCircleFilled';
import UnfoldMore from '@material-ui/icons/UnfoldMore';
import UnfoldLess from '@material-ui/icons/UnfoldLess';
import TimerIcon from '@material-ui/icons/Timer';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import {countDown} from "../redux/entityDataReducer";
import AgendaItem from "./AgendaItem";
import {formatSeconds} from "../Util/WindowUtils";
import Room from "./Room";
import AgendaItemTools from "./AgendaItemTools";

class PlanList extends React.Component {

    constructor(p) {
        super(p);
        this.state = {
            activeStep: -1,
            showAll: false,
            running: false,
            headers: [],
            topPad:0,
            showDrawer:false,
            meeting: p.meeting || false
        }

        this.runTimers = this.runTimers.bind(this);
        this.stopTimers = this.stopTimers.bind(this);
    }

    toggleDrawer() {
        this.setState({showDrawer:!this.state.showDrawer});
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
            this.setState({activeStep: 0, running: true}, this.runTimers);
            document.getElementById('meetingAgenda').scrollIntoView({block:'start', behavior:'smooth'})
        } else if (this.state.running === false) {
            this.setState({running: true}, this.runTimers)
        } else {
            if (this.props.meeting.countRemains === 0) {
                this.stopTimers();
                return 'rally complete';
            }
            if (this.state.activeStep < this.props.meeting.agenda.length - 1) {
                if (this.props.meeting.agenda[this.state.activeStep].countdown === 0) {
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

    toggleAll() {
        this.setState({showAll: !this.state.showAll}, () => {
            if (this.state.showAll === true) {
                document.getElementById('meetingAgenda').scrollIntoView({block:'start', behavior:'smooth'})
            }
        })
    }

    render() {
        if (!this.props.meeting || !this.props.meeting.headers) return 'loading agenda...'

        const {classes} = this.props;
        const {activeStep} = this.state;
        let nesting = {};

        return (
            <div className={classes.root} style={{marginTop: 20, textAlign: 'left'}}>
            <Grid container>
            <Grid Item className="videoArea" sm={12} md={6}>

                <AppBar position={'sticky'} className={classes.appBar} >
                    <Room classes={classes} />
                </AppBar>
                </Grid>

            <Grid Item sm={12} md={6}>

                <AppBar className="agendatoolbar" position="relative" color="primary" >
                    <Toolbar>
                        <Grid container justify={'space-between'} alignItems={'center'}>

                            {this.state.running === true ?
                                <Button variant={'contained'} color={'secondary'} onClick={this.stopTimers}
                                        startIcon={<StopIcon/>}>Pause</Button>
                                :
                                <Button variant={'contained'} color={'secondary'} onClick={this.runTimers}
                                        startIcon={<TimerIcon />}>Start Clock</Button>
                            }

                            <Typography variant='h6' >
                                <Typography variant='inherit'
                                            color={'error'}> {formatSeconds(this.props.meeting.countRemains)} </Typography>
                                /
                                <Typography
                                    variant='inherit'> {formatSeconds(this.props.meeting.countScheduled)}</Typography>
                            </Typography>

                            {this.state.showAll === true ?
                                <Button style={{alignSelf: 'center'}} startIcon={<UnfoldLess/>} variant='contained'
                                        color={'secondary'}
                                        onClick={e => this.toggleAll()}>Close All</Button>
                                :
                                <Button style={{alignSelf: 'center'}} startIcon={<UnfoldMore/>} variant='contained'
                                        color={'secondary'}
                                        onClick={e => this.toggleAll()}>Read Agenda</Button>
                            }


                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                edge="end"
                                onClick={() => this.toggleDrawer()}
                            >
                                <MenuIcon />
                            </IconButton>

                        </Grid>
                    </Toolbar>
                </AppBar>

                <div className={classes.agendaContent} id={'meetingAgenda'}>

                    <Stepper activeStep={activeStep} orientation="vertical" className={classes.vertStepper} >
                        {this.props.meeting.agenda.map((curItem, index) => {
                            let header = null;
                            if (curItem.nest.length > 0) {
                                if (typeof nesting[curItem.nest] === 'undefined') {
                                    nesting[curItem.nest] = true;
                                    header = this.props.meeting.headers.find(h => h.label === curItem.nest);
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

                    {activeStep === this.props.meeting.agenda.length && (
                        <Paper square elevation={0} className={classes.resetContainer}>
                            <Button onClick={this.handleReset} className={classes.button}>
                                Reset Clock
                            </Button>
                        </Paper>
                    )}


                    <Drawer
                        variant="persistent"
                        anchor="right"
                        id={'notesDrawer'}
                        className={this.state.showDrawer ? classes.drawer :[classes.drawer, classes.hide].join(' ')}
                        classes={{paper: classes.drawerInner}}
                        open={this.state.showDrawer}
                    >
                        <AgendaItemTools classes={classes} />
                    </Drawer>


                </div>
                </Grid>
                </Grid>


            </div>
        );
    }

}


export default PlanList;
