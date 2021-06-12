import React from 'react';
import HtmlEditor from "./HtmlEditor";
import SpeakerNotes from '@material-ui/icons/SpeakerNotes';
import Sms from '@material-ui/icons/Sms';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import '../theme/AgendaItemOverride.css';
import ButtonGroup from "@material-ui/core/ButtonGroup";

class AgendaItemTools extends React.Component {

    constructor(p) {
        super(p);
        this.state = {showNotes: true, showChat: false, notes: {'private': '', 'chat': ''}}
    }

    handleNote(val, type) {
        let notes = {...this.state.notes};
        notes[type] = val;
        this.setState({notes: notes});
    }

    render() {
        return (
            <Box id={'notesDrawer'} style={{backgroundColor: '#ffffff'}}>

                <ButtonGroup fullWidth={true} size={'small'} style={{marginBottom:8}}>
                    <Button endIcon={<Sms className="chat"/>}
                            onClick={() => this.setState({showChat: !this.state.showChat})}>Chat</Button>
                    <Button endIcon={<SpeakerNotes className="private"/>}
                            onClick={() => this.setState({showNotes: !this.state.showNotes})}>Notes</Button>
                </ButtonGroup>

                {this.state.showChat && <Box>
                    <div style={{padding: 30, textAlign: 'center'}}> Chat service coming soon</div>
                </Box>}
                {this.state.showNotes && <Box>
                    <HtmlEditor
                        label="Private Notes"
                        toolbar={'static'}
                        style={{width: '100%'}}
                        variant={'outlined'}
                        rows={3}
                        html={this.state.notes.private}
                        onChange={val => this.handleNote(val, 'private')}
                    />
                </Box>
                }
            </Box>

        );
    }
}


export default AgendaItemTools;
