import React, {Component} from 'react';
import VideoRecorder from 'react-video-recorder' // maybe better choice: https://www.npmjs.com/package/react-media-recorder ?
import {withStyles} from "@material-ui/core/styles";
import OndemandVideo from '@material-ui/icons/OndemandVideo';
import DragIcon from '@material-ui/icons/OpenWith';
import Draggable from 'react-draggable';
import Paper from '@material-ui/core/Paper';

function PaperComponent(props) {
    return (
        <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
            <Paper {...props} />
        </Draggable>
    );
}

class MediaRecorder extends Component {

    constructor(props) {
        super(props);
        this.state = {}
        this.actionHandler = this.actionHandler.bind(this);
        this.handleRecordingComplete = this.handleRecordingComplete.bind(this);
        this.onTitleChange = this.onTitleChange.bind(this);
        this.onRateChange = this.onRateChange.bind(this);
    }

    actionHandler(e) {
        console.log(e);
    }

    handleRecordingComplete(e) {
        // console.log(e);
        // this.setState({filedata: e, mediatype:e.type});
    }


    onTitleChange(e) {
        // this.setState({mediaTitle: e.target.value});
    }

    onRateChange(e) {
        // this.setState({ppp: parseFloat(e.target.value).toFixed(3)});
    }

    render() {
        return (
            <PaperComponent style={{maxWidth:300}}>
                <div id='draggable-dialog-title' style={{textAlign:'center', paddingTop:2, paddingBottom:2}}>
                <DragIcon />
                </div>
                <VideoRecorder
                    renderDisconnectedView={e => <OndemandVideo />}
                    showReplayControls
                    onRecordingComplete={this.handleRecordingComplete}
                    onOpenVideoInput={this.actionHandler}
                    onError={this.actionHandler}
                    style={{maxWidth:600}}
                />
            </PaperComponent>
        );
    }
}


const styles = theme => ({
    mediaEl: {
        width: '100%',
        minHeight: 20,
        margin: '8px 0'
    },
    uploadBtn: {
        width: '100%',
        textTransform: 'none',
        margin: '8px 0'
    },
    videoEl: {
        maxHeight: '90vh',
        maxWidth: '100%',
        minHeight: 250,
        margin: '8px 0'
    },
    inlineBulletList: {
        flexDirection: 'row-reverse',
        textAlign: 'center', justifyContent: 'center', width: '100%', marginTop: 20,
        letterSpacing: 1,
        fontWeight: 600,
        lineHeight: '26px',
        '& a': {
            textDecoration: 'none'
        }
    }
});


export default withStyles(styles)(MediaRecorder);
