import React from 'react';
import PropTypes from 'prop-types';
import SpeakerNotes from '@material-ui/icons/SpeakerNotes';
import HtmlEditor from "./HtmlEditor";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import '../AgendaItemOverride.css';

class AgendaItemTools extends React.Component {

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
                                    
                                    let type = index === 0 ? 'gsheets' : index === 1 ? 'gdocs' : 'private';
                                    this.toggleNotes(type);
                                }}
                                aria-label="Note Controls"
                                className={this.state.showNotes.length > 0 ? classes.tabsHorz : classes.tabsVert}
                                classes={{flexContainer:classes.spaceAround}}
                            >
                                <Tab icon={<img alt={'sheets'} className="gsheets"   src={'/images/Google_Sheets_logo.png'} />}  classes={{root:classes.tabsIcon}} />
                                <Tab icon={<img alt={'docs'} className="gdocs"  src={'/images/Google_Docs_logo.png'} />}  classes={{root:classes.tabsIcon}} />
                                <Tab icon={<SpeakerNotes className="private" />}  classes={{root:classes.tabsIcon}} />
                            </Tabs>
                        
                            <div style={{maxHeight:'460px', overflowY:'auto',overflowX:'hidden'}}>
                                <TabPanel value={this.state.showNotes} index={'gsheets'}>
                                    <iframe
                                        title='Google Sheets'
                                        src='https://docs.google.com/spreadsheets/d/1RO1mgOJoZjhGFnh0SnW4ev212LHd3byP1J-zi2BKMp8/edit?usp=sharing&rm=minimal'
                                        width={'100%'} height={'450'} seamless />
                                </TabPanel>
                                <TabPanel value={this.state.showNotes} index={'gdocs'}>
                                    <iframe
                                        title='Google Docs'
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
