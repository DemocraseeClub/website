import React from 'react';
import PropTypes from 'prop-types';
import HtmlEditor from "./HtmlEditor";
import SpeakerNotes from '@material-ui/icons/SpeakerNotes';
import Sms from '@material-ui/icons/Sms';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import '../theme/AgendaItemOverride.css';

class AgendaItemTools extends React.Component {

    constructor(p) {
        super(p);
        this.state = {showNotes: [], notes: {'private':'', 'chat':''}}
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

        let selected = new Set();
        document.querySelectorAll('.MuiTabs-flexContainer>.MuiButtonBase-root').forEach((btn, idx) => {
             btn.style.backgroundColor = "white"
             showNotes.forEach(n => {

                if(btn.firstElementChild.firstElementChild.classList.contains(n))
                    selected.add(btn)

             })

        })

        selected.forEach(btn => {
            btn.style.backgroundColor = "rgb(199, 199, 199)"
        })

        this.setState({showNotes: showNotes});
    }

    render() {
        const {classes} = this.props;

        return (
                        <React.Fragment>

                            <Tabs
                                orientation={this.state.showNotes.length > 0 ? "horizontal" : "vertical"}
                                variant="standard"
                                id={"noteTabs"}
                                value={this.state.showNotes}
                                onChange={(e, index) => {

                                    let type = index === 0 ? 'chat' : 'private';
                                    this.toggleNotes(type);
                                }}
                                aria-label="Note Controls"
                                className={this.state.showNotes.length > 0 ? classes.tabsHorz : classes.tabsVert}
                                classes={{flexContainer:classes.spaceAround}}
                            >
                                <Tab icon={<Sms className="chat" />} classes={{root:classes.tabsIcon}} />
                                <Tab icon={<SpeakerNotes className="private" />} classes={{root:classes.tabsIcon}} />
                            </Tabs>

                            <div style={{maxHeight:'460px', overflowY:'auto',overflowX:'hidden'}}>
                                <TabPanel value={this.state.showNotes} index={'chat'}>
                                    <div style={{padding:30, textAlign:'center'}}> Chat service coming soon</div>
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

                            </div>
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


export default AgendaItemTools;
