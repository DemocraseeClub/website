import React from "react";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Grid from "@material-ui/core/Grid";
import Toolbar from "@material-ui/core/Toolbar";
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import RemoteVideo from "./RemoteVideo";
import Config from "../Config";
import Check from '@material-ui/icons/CheckBox';
import Unchecked from '@material-ui/icons/CheckBoxOutlineBlank';
import {withSnackbar} from 'notistack';
import VideoElement from "./VideoElement";

import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
const VideoStreamMerger = require('video-stream-merger')


class Room extends React.Component {

    constructor(p) {
        super(p);
        this.state = {
            myRoom: null,
            enabled: {'video': false, 'audio': false, 'screen': false},
            roomsViewing: [],
            myStream:null,
            viewers: [],
            roomFieldText: ''
        }

        this.peerConnection = null;
        this.screenStream = null;
        this.camStream = null;

        this.castBtnRef = React.createRef();
    }

    async componentWillUnmount() {
        await this.hangUp();
    }

    displayLocalStreams() {
        let stream = null;
        if (this.camStream && this.screenStream) {
            var merger = new VideoStreamMerger()

            // Add the screen capture. Position it to fill the whole stream (the default)
            merger.addStream(this.screenStream, {
                x: 0, // position of the topleft corner
                y: 0,
                width: merger.width,
                height: merger.height,
                mute: true // we don't want sound from the screen (if there is any)
            })

            // Add the webcam stream. Position it on the bottom left and resize it to 100x100.
            merger.addStream(this.camStream, {
                x: 0,
                y: merger.height - Math.round(merger.height / 6),
                width: Math.round(merger.width / 6),
                height: Math.round(merger.height / 6),
                mute: this.state.enabled.audio === true ? false : true
            })

            // Start the merging. Calling this makes the result available to us
            merger.start()

            // We now have a merged MediaStream!
            stream = merger.result;
        } else if (this.screenStream) {
            stream = this.screenStream;
        } else if (this.camStream) {
            stream = this.camStream;
        }

        if (this.peerConnection) {
            console.log("adding local stream on display");
            stream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, stream);
            });
        }

        this.setState({myStream:stream});

    }

    async toggleCamMic(type) {
        let enable = {...this.state.enabled};
        enable[type] = !this.state.enabled[type];
        if (enable[type] === true) {
            let stream = await window.navigator.mediaDevices.getUserMedia(enable);
            this.camStream = stream;
        } else if (enable.video === false && enable.audio === false) {
            this.camStream.getTracks().forEach(function(track) {
                track.stop();
            });
            this.camStream = null;
        }
        this.setState({enabled: enable}, () => this.displayLocalStreams());
    }

    async shareScreen() {
        let enable = {...this.state.enabled}
        enable.screen = !enable.screen;
        if (enable.screen === false) {
            this.setState({enabled: enable});
        } else {
            let stream = await navigator.mediaDevices.getDisplayMedia({cursor: true});
            this.screenStream = stream;
            this.setState({enabled: enable}, () => this.displayLocalStreams());
        }
    }

    createPeerConnection() {
        console.log('Create PeerConnection with configuration: ', Config.peerConfig);
        let peerConnection = new RTCPeerConnection(Config.peerConfig);
        peerConnection.addEventListener('icegatheringstatechange', () => {
            console.log(`ICE gathering state changed: ${peerConnection.iceGatheringState}`);
        });

        peerConnection.addEventListener('connectionstatechange', () => {
            console.log(`Connection state change: ${peerConnection.connectionState}`);
        });

        peerConnection.addEventListener('signalingstatechange', () => {
            console.log(`Signaling state change: ${peerConnection.signalingState}`);
        });

        peerConnection.addEventListener('iceconnectionstatechange ', () => {
            console.log(`ICE connection state change: ${peerConnection.iceConnectionState}`);
        });


        if (this.state.myStream) {
            console.log("adding local stream");
            let stream = this.state.myStream;
            stream.getTracks().forEach(track => {
                peerConnection.addTrack(track, stream);
            });
            this.setState({myStream:stream})
        }

        return peerConnection;
    }

    async createRoom() {
        if (!this.db) {
            this.db = window.firebase.firestore();
        }
        const roomRef = await this.db.collection('rooms').doc();

        this.peerConnection = this.createPeerConnection();

        this.peerConnection.onaddstream = (event => {
            console.log("ON ADDED STREAM createRoom", event);
            this.setState({myStream:event.stream})
        });

        // Code for collecting ICE candidates below
        const callerCandidatesCollection = roomRef.collection('callerCandidates');
        this.peerConnection.addEventListener('icecandidate', event => {
            if (!event.candidate) {
                console.log('Got final candidate!');
                return;
            }
            console.log('Got candidate: ', event.candidate);
            callerCandidatesCollection.add(event.candidate.toJSON());
        });
        // Code for collecting ICE candidates above

        // Code for creating a room below
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        console.log('Created offer:', offer);

        const roomWithOffer = {'offer': {type: offer.type, sdp: offer.sdp}};
        await roomRef.set(roomWithOffer);

        this.peerConnection.addEventListener('track', event => {
            console.log('Got viewer track:', event);
            let rooms = [...this.state.viewers];
            rooms.push({roomId: this.state.myRoom, stream: event.streams[0]});
            this.setState({viewers: rooms})
        });

        this.peerConnection.ontrack = event => {
            console.log('Got viewer track2:', event);
            let rooms = [...this.state.viewers];
            rooms.push({roomId: this.state.myRoom, stream: event.streams[0]});
            this.setState({viewers: rooms})
        }

        // Listening for remote session description below
        roomRef.onSnapshot(async snapshot => {
            const data = snapshot.data();
            if (!this.peerConnection.currentRemoteDescription && data && data.answer) {
                console.log('Got remote description: ', data.answer);
                const rtcSessionDescription = new RTCSessionDescription(data.answer);
                await this.peerConnection.setRemoteDescription(rtcSessionDescription);
            }
        });
        // Listening for remote session description above

        // Listen for remote ICE candidates below
        roomRef.collection('calleeCandidates').onSnapshot(snapshot => {
            snapshot.docChanges().forEach(async change => {
                if (change.type === 'added') {
                    let data = change.doc.data();
                    console.log(`Got new remote calleeCandidates: ${JSON.stringify(data)}`);
                    await this.peerConnection.addIceCandidate(new RTCIceCandidate(data));
                }
            });
        });
        // Listen for remote ICE candidates above


        this.setState({myRoom: roomRef.id});
        this.props.enqueueSnackbar(`Share your room ID - ${roomRef.id} - with anyone you want to view your broadcast`);
        return this.peerConnection;

    }

    joinRoom() {
        let newRoomId = this.state.roomFieldText;
        let rooms = [...this.state.roomsViewing];
        let i = rooms.find(o => o.roomId === newRoomId);
        if (!i) {
            let room = {roomId: newRoomId, stream: new MediaStream()};

            console.log('adding room', room);
            rooms.push(room);
            this.setState({roomsViewing: rooms}, e => {
                this.setState({roomFieldText: ''})
            })
        } else {
            console.log('room already exists');
        }
    }

    async hangUp() {
        console.log("HANGING UP MY ROOM!");
        let cams = ['camStream', 'screenStream'];
        cams.forEach(cam => {
            if (this[cam]) {
                const tracks = this[cam].getTracks();
                tracks.forEach(track => {
                    track.stop();
                });
            }
        })

        this.camStream = null;
        this.screenStream = null;

        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }

        if (this.state.myRoom) {
            const roomRef = this.db.collection('rooms').doc(this.state.myRoom);
            const calleeCandidates = await roomRef.collection('calleeCandidates').get();
            for (let l = 0; l < calleeCandidates.length; l++) {
                await calleeCandidates[l].ref.delete();
            }
            const callerCandidates = await roomRef.collection('callerCandidates').get();
            for (let l = 0; l < callerCandidates.length; l++) {
                await callerCandidates[l].ref.delete();
            }
            await roomRef.delete();
        }
        this.setState({myRoom:null, myStream:null, enabled: {'video': false, 'audio': false, 'screen': false}});
    }

    handleClose(event) {
        if (this.castBtnRef.current && this.castBtnRef.current.contains(event.target)) {
            return;
        }
        this.setState({showCastOptions:false});
    };

    render() {
        const isEnabled = this.state.enabled.video === true || this.state.enabled.audio === true || this.state.enabled.screen === true;
        const hasVideos = (this.state.myStream || this.state.viewers.length > 0 || this.state.roomsViewing.length > 0);

        return (
            <React.Fragment>
                <Toolbar>
                    <Grid container justify={'space-between'} alignItems="center">

                        {(this.state.myRoom) ? '' :
                            <Grid item>
                                <ButtonGroup variant="contained" color="secondary" aria-label="broadcast options" >
                                    { (this.state.myRoom) ?
                                        <Button onClick={e => this.hangUp()}>Hangup</Button>
                                        :
                                        <Button disabled={isEnabled === false} onClick={e => this.createRoom('me')}>Broadcast</Button>
                                    }
                                    <Button
                                        ref={this.castBtnRef}
                                        color="primary"
                                        aria-controls={this.state.showCastOptions ? 'split-button-menu' : undefined}
                                        aria-expanded={this.state.showCastOptions ? 'true' : undefined}
                                        aria-label="broadcast options"
                                        aria-haspopup="menu"
                                        onClick={() => this.setState({showCastOptions:!this.state.showCastOptions})}
                                    >
                                        <ArrowDropDownIcon />
                                    </Button>
                                </ButtonGroup>
                                <Popper open={this.state.showCastOptions}
                                        anchorEl={this.castBtnRef}
                                        transition disablePortal
                                        anchorOrigin={{
                                            vertical: 'top',
                                            horizontal: 'right',
                                        }}
                                        transformOrigin={{
                                            vertical: 'bottom',
                                            horizontal: 'left',
                                        }}
                                >
                                    {({ TransitionProps, placement }) => (
                                        <Grow
                                            {...TransitionProps}
                                            style={{transformOrigin: 'left bottom'}} >
                                            <Paper>
                                                <ClickAwayListener onClickAway={e => this.handleClose(e)}>
                                                    <ButtonGroup variant="contained" color="primary" aria-label="broadcast options"  >
                                                        <Button endIcon={this.state.enabled.video === true ? <Check/> : <Unchecked/>}
                                                                onClick={e => this.toggleCamMic('video')}>Cam</Button>
                                                        <Button endIcon={this.state.enabled.audio === true ? <Check/> : <Unchecked/>}
                                                                onClick={e => this.toggleCamMic('audio')}>Mic</Button>
                                                        <Button endIcon={this.state.enabled.screen === true ? <Check/> : <Unchecked/>}
                                                                onClick={e => this.shareScreen()}>Screen</Button>
                                                        </ButtonGroup>
                                                </ClickAwayListener>
                                            </Paper>
                                        </Grow>
                                    )}
                                </Popper>
                            </Grid>
                        }
                        <Divider orientation="vertical" style={{flexGrow:1}} />

                        <TextField
                            size={'small'}
                            margin={'dense'}
                            label="Enter Room ID"
                            variant={'filled'}
                            color="secondary"
                            value={this.state.roomFieldText}

                            onChange={e => this.setState({roomFieldText: e.target.value})}
                            InputProps={{
                                endAdornment: (
                                    <Button onClick={e => this.joinRoom()} variant={'contained'} color={'secondary'}
                                            disabled={this.state.roomFieldText === ''}>Connect</Button>
                                )
                            }}
                        />

                    </Grid>
                </Toolbar>
                {hasVideos === false ? '' :
                <div className={this.props.classes.hScrollContainer}>
                    <div className={this.props.classes.hScroller} >
                        {this.state.myStream ?
                            <div className={this.props.classes.hScrollItem} ><VideoElement roomId={this.state.myRoom} stream={this.state.myStream} muted={true} viewers={this.state.viewers.length} /></div> : ''}
                        {this.state.viewers.map((o, i) =>
                            <div className={this.props.classes.hScrollItem} key={o.roomId+i} ><VideoElement roomId={o.roomId} stream={o.stream} /></div>)}
                        {this.state.roomsViewing.map((o, i) =>
                            <div className={this.props.classes.hScrollItem} key={o.roomId+i} ><RemoteVideo roomId={o.roomId} stream={o.stream} db={this.db} /></div>)}
                    </div>
                </div> }
            </React.Fragment>
        );
    }
}

export default withSnackbar(Room);
