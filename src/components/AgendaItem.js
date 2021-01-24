import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import SanitizedHTML from 'react-sanitized-html';
import PropTypes from 'prop-types';
import Check from '@material-ui/icons/CheckBox';
import SpeakerNotes from '@material-ui/icons/SpeakerNotes';
import Unchecked from '@material-ui/icons/CheckBoxOutlineBlank';
import {withSnackbar} from 'notistack';
import Config from '../Config';
import AgendaItemForm from "./AgendaItemForm";
import HtmlEditor from "./HtmlEditor";
import ResizePanel from "react-resize-panel";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
// import SvgIcon from '@material-ui/core/SvgIcon';
// import {ReactComponent as GoogleSheetsIcon} from '../assets/Google_Sheets_logo.png';
// import {ReactComponent as GoogleDocsIcon} from '../assets/Google_Docs_logo.png';

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

    if (typeof countdown !== 'number') return <div className={classes.circle} />

    return (
        <div>
            {status === 'completed' ?
                <Check className={classes.completed} color={color}/> :
                <Unchecked color={color}/>
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

class AgendaItem extends React.Component {

    constructor(p) {
        super(p);
        this.state = {
            notes: {'private':'', 'gdocs':'', 'gsheets':''},
            showNotes: []
        }
        this.toggleNotes = this.toggleNotes.bind(this);
    }

    handleNote(val, type) {
        let notes = {...this.state.notes};
        notes[type] = val;
        this.setState({notes: notes});
    }

    toggleNotes(type) {
        let showNotes = [...this.state.showNotes];
        let i = this.state.showNotes.indexOf(type);
        if (i > -1) {
            showNotes.splice(i,1);
        } else {
            showNotes.push(type);
        }
        this.setState({showNotes: showNotes});
    }

    renderOutline(outline, indent) {
        if (typeof outline === 'string') {
            return outline;
        }

        return outline.map((v, i) => {
            if (typeof v === 'string') {
                let liStyle = {paddingLeft: 30 * indent, display: 'list-item', listStylePosition: 'inside'}
                liStyle.listStyleType = indent % 2 === 0 ? 'disc' : Math.floor(indent / 2) % 2 === 0 ? 'circle' : 'square';
                return <div style={liStyle} key={indent + 'x' + i}>{v}</div>
            } else {
                return this.renderOutline(v, indent + 1);
            }
        })
    }

    render() {
        const {classes, curItem, index, activeStep} = this.props;
        const PanelWrap = (true || this.state.resizable) ? ResizePanel : React.Fragment;

        return (
            <Step key={'step-' + index} active={this.props.forceShow === true || activeStep === index ? true : undefined} style={{marginBottom:10}} >
                {this.props.header}
                <StepLabel className={classes.stepTimeBlock}
                           StepIconComponent={QontoStepIcon}
                           StepIconProps={curItem}>
                    <div className={classes.stepLabel}>
                        <Typography className={classes.stepLabelText} variant={'h5'}>{curItem.title}</Typography>
                        {this.props.editMode === true ? <AgendaItemForm item={curItem} index={index} classes={classes} dispatch={this.props.dispatch}/> : null}
                    </div>
                </StepLabel>
                <StepContent className={classes.stepContent}>
                    <Grid container justify={'space-around'} spacing={0}>
                        <Grid item xs={this.state.showNotes.length === 0 ? 11 : 6} style={{fontSize: 20}}>
                            {curItem.html ?
                                <SanitizedHTML
                                    allowedIframeDomains={['youtube.com', 'google.com']}
                                    allowedTags={Config.allowedTags}
                                    allowedAttributes={Config.allowedAttributes}
                                    html={curItem.html} /> : null}

                            {(curItem.outline) ? this.renderOutline(curItem.outline, 0) : null}

                            {(activeStep === index) ?
                                    <div className={classes.actionsContainer}>
                                        {activeStep > 0 ?
                                            <Button size="small" onClick={this.props.handleBack}
                                                    className={classes.button}>Back</Button> : null
                                        }
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            size="small"
                                            endIcon={<Check/>}
                                            onClick={this.props.handleNext}
                                            className={classes.button}>
                                            Done
                                        </Button>
                                    </div> : null
                            }
                        </Grid>
                        <Grid item xs={this.state.showNotes.length === 0 ? 1 : 6}>
                            <Tabs
                                orientation={this.state.showNotes.length > 0 ? "horizontal" : "vertical"}
                                variant="standard"
                                value={this.state.showNotes}
                                onChange={(e, index) => {
                                    let type = index === 0 ? 'gsheets' : index === 1 ? 'gdocs' : 'private';
                                    this.toggleNotes(type);
                                }}
                                aria-label="Note Controls"
                                className={this.state.showNotes.length > 0 ? classes.tabsHorz : classes.tabsVert}
                                classes={{flexContainer:classes.spaceAround}}
                            >
                                <Tab icon={<img src={'/images/Google_Sheets_logo.png'} />} classes={{root:classes.tabsIcon}}  />
                                <Tab icon={<img src={'/images/Google_Docs_logo.png'} />} classes={{root:classes.tabsIcon}} />
                                <Tab icon={<SpeakerNotes/>}  classes={{root:classes.tabsIcon}} />
                            </Tabs>

                            <TabPanel value={this.state.showNotes} index={'gsheets'}>
                                    <iframe
                                        src='https://docs.google.com/spreadsheets/d/15DFFyO-OlJgHBFKhBK587VSR6mHSkmgZkQjZEpYS6KM/edit?usp=sharing&minimal=true'
                                        width={'100%'} height={'250'} seamless />
                            </TabPanel>
                            <TabPanel value={this.state.showNotes} index={'gdocs'}>
                                    <iframe
                                        src='https://docs.google.com/document/d/1hRQ8W8X2pHuaKXXVVlF0H4RcGHF_5YOBbRob6lOLTqk/edit?usp=sharing&minimal=true'
                                        width={'100%'} height={'250'} seamless/>
                            </TabPanel>
                            <TabPanel value={this.state.showNotes} index={'private'}>
                                    <HtmlEditor
                                        label="Shared Notes"
                                        toolbar={'static'}
                                        style={{width: '100%'}}
                                        variant={'outlined'}
                                        rows={3}
                                        html={this.state.notes[index] ? this.state.notes[index].shared : ''}
                                        onChange={val => this.handleNote(val, index, 'shared')}
                                    />
                            </TabPanel>
                        </Grid>
                    </Grid>
                </StepContent>
            </Step>

        );
    }
}

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    let isVisible = value.indexOf(index) > -1;

    return (
        <div
            role="tabpanel"
            hidden={isVisible === false}
            id={`ai-tabpanel-${index}`}
            aria-labelledby={`ai-tab-${index}`}
            {...other}
        >
            {isVisible === true ? children : ''}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};


export default withSnackbar(AgendaItem);
