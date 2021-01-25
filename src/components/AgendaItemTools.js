import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Check from '@material-ui/icons/CheckBox';
import SpeakerNotes from '@material-ui/icons/SpeakerNotes';
import Unchecked from '@material-ui/icons/CheckBoxOutlineBlank';
import {withSnackbar} from 'notistack';
import HtmlEditor from "./HtmlEditor";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

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
        this.state = {showNotes: [], notes: {'private':'', 'gdocs':'', 'gsheets':''}}
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

    render() {
        const {classes} = this.props;

        return (
                        <React.Fragment>
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
                                <Tab icon={<img src={'/images/Google_Sheets_logo.png'} />} classes={{root:classes.tabsIcon}} />
                                <Tab icon={<img src={'/images/Google_Docs_logo.png'} />} classes={{root:classes.tabsIcon}} />
                                <Tab icon={<SpeakerNotes/>} classes={{root:classes.tabsIcon}} />
                            </Tabs>

                            <TabPanel value={this.state.showNotes} index={'gsheets'}>
                                <iframe
                                    src='https://docs.google.com/spreadsheets/d/1RO1mgOJoZjhGFnh0SnW4ev212LHd3byP1J-zi2BKMp8/edit?usp=sharing&rm=minimal'
                                    width={'100%'} height={'450'} seamless />
                            </TabPanel>
                            <TabPanel value={this.state.showNotes} index={'gdocs'}>
                                <iframe
                                    src='https://docs.google.com/document/d/1bg5p_GKXJ81CX9YhpvMVepakOcgBYDlLAYaRdFrIV0M/edit?usp=sharing&&rm=minimal'
                                    width={'100%'} height={'450'} seamless />
                            </TabPanel>
                            <TabPanel value={this.state.showNotes} index={'private'}>
                                <HtmlEditor
                                    label="Private Notes"
                                    toolbar={'static'}
                                    style={{width: '100%'}}
                                    variant={'outlined'}
                                    rows={3}
                                    html={this.state.notes.private}
                                    onChange={val => this.handleNote(val, 'private')}
                                />
                            </TabPanel>
                        </React.Fragment>

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
