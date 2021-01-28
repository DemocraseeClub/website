import React from "react";
import DragBox from "./DragBox";
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

class Room extends React.Component {

    constructor(p) {
        super(p);
        this.state = {
            myRoom: null,
            enabled: {'video': false, 'audio': false, 'screen': false},
            roomsViewing: [],
            roomFieldText: ''
        }

        try {
            this.db = window.firebase.firestore();
        } catch (e) {
            this.db = e => console.log(e);
        }

        this.peerConnection = null;
        this.screenStream = null;
        this.camStream = null;

        this.senders = [];

        this.myVideo = React.createRef();
    }

    async componentWillUnmount() {
        await this.hangUp();
    }

    displayLocalStreams() {
        if (this.camStream && this.screenStream) {
            // TODO: merge with https://github.com/t-mullen/video-stream-merger
            var VideoStreamMerger = require('video-stream-merger')

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
                y: merger.height - 100,
                width: 100,
                height: 100,
                mute: false
            })

            // Start the merging. Calling this makes the result available to us
            merger.start()

            // We now have a merged MediaStream!
            this.myVideo.current.srcObject = merger.result;
        } else if (this.screenStream) {
            this.myVideo.current.srcObject = this.screenStream;
        } else if (this.camStream) {
            this.myVideo.current.srcObject = this.camStream;
        }
    }

    async toggleCamMic(type) {
        let enable = {video: this.state.enabled.video, audio: this.state.enabled.audio};
        enable[type] = !this.state.enabled[type];
        if (enable[type] === false) {
            this.setState({enabled: enable});
        } else {
            let stream = await window.navigator.mediaDevices.getUserMedia(enable);
            this.camStream = stream;
            this.setState({enabled: enable}, () => this.displayLocalStreams());
        }
    }

    async shareScreen() {
        let enable = {...this.state.enabled}
        enable.screen = !enable.screen;
        if (enable.screen === false) {
            this.setState({enabled: enable});
        } else {
            let stream = await navigator.mediaDevices.getDisplayMedia({cursor: true});

            /*
            const screenTrack = stream.getTracks()[0];
            let vidsender = this.senders.find(sender => sender.track.kind === 'video');
            if (vidsender) {
                vidsender.replaceTrack(screenTrack);
                screenTrack.onended = function () {
                    this.senders.find(sender => sender.track.kind === "video").replaceTrack(this.screenVideo.current.getTracks()[1]);
                }
            }
            */

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


        if (this.myVideo.current) {
            let stream = this.myVideo.current.srcObject;
            stream.getTracks().forEach(track => {
                peerConnection.addTrack(track, stream);
            });
        }

        return peerConnection;
    }

    async createRoom(owner) {
        const roomRef = await this.db.collection('rooms').doc();

        let peerConnection = this.createPeerConnection();

        // Code for collecting ICE candidates below
        const callerCandidatesCollection = roomRef.collection('callerCandidates');
        peerConnection.addEventListener('icecandidate', event => {
            if (!event.candidate) {
                console.log('Got final candidate!');
                return;
            }
            console.log('Got candidate: ', event.candidate);
            callerCandidatesCollection.add(event.candidate.toJSON());
        });
        // Code for collecting ICE candidates above

        // Code for creating a room below
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        console.log('Created offer:', offer);

        const roomWithOffer = {'offer': {type: offer.type, sdp: offer.sdp}};
        await roomRef.set(roomWithOffer);
        this.props.enqueueSnackbar(`Share your room ID - ${roomRef.id} - with anyone you want to view your broadcast`);

        // Listening for remote session description below
        roomRef.onSnapshot(async snapshot => {
            const data = snapshot.data();
            if (!peerConnection.currentRemoteDescription && data && data.answer) {
                console.log('Got remote description: ', data.answer);
                const rtcSessionDescription = new RTCSessionDescription(data.answer);
                await peerConnection.setRemoteDescription(rtcSessionDescription);
            }
        });
        // Listening for remote session description above

        // Listen for remote ICE candidates below
        roomRef.collection('calleeCandidates').onSnapshot(snapshot => {
            snapshot.docChanges().forEach(async change => {
                if (change.type === 'added') {
                    let data = change.doc.data();
                    console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
                    await peerConnection.addIceCandidate(new RTCIceCandidate(data));
                }
            });
        });
        // Listen for remote ICE candidates above

        peerConnection.addEventListener('track', event => {
            console.log('Got remote track:', event.streams[0]);
            event.streams[0].getTracks().forEach(track => {
                console.log('Add a track to the remoteStream:', track);
                if (this.myVideo.current) {
                    this.myVideo.current.srcObject.addTrack(track);
                }
            });
        });

        this.peerConnection = peerConnection;
        this.setState({myRoom: roomRef.id});

        return peerConnection;

    }

    joinRoom() {
        let newRoomId = this.state.roomFieldText;
        let rooms = [...this.state.roomsViewing];
        let i = rooms.find(o => o.roomId === newRoomId);
        if (!i) {
            let room = {roomId: newRoomId, stream: new MediaStream(), peer: null};
            room.peer = (newRoomId === this.state.myRoom) ? this.peerConnection : this.createPeerConnection()
            console.log('adding room', room);
            rooms.push(room);
            this.setState({roomsViewing: rooms}, e => {
                this.setState({roomFieldText: ''})
            })
        } else {
            console.log('room already exists');
        }
    }

    async hangUp(e) {
        let cams = ['camStream', 'screenStream'];
        cams.forEach(cam => {
            if (this[cam]) {
                const tracks = this[cam].getTracks();
                tracks.forEach(track => {
                    track.stop();
                });
            }
        })

        if (this.peerConnection) {
            this.peerConnection.close();
        }

        if (this.myVideo.current) {
            this.myVideo.current.srcObject = null;
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
    }

    render() {
        const isEnabled = this.state.enabled.video === true || this.state.enabled.audio === true || this.state.enabled.screen === true

        return (
            <React.Fragment>
                <Toolbar>
                    <Grid container justify={'space-between'} alignItems="center">

                        <Grid item style={{marginRight:10}}>
                            { (this.state.myRoom) ?
                                    <div>
                                        <label>My Room: {this.state.myRoom}</label>
                                        <Button variant={'outline'} color={'secondary'} onClick={e => this.hangUp()}>Hangup</Button>
                                    </div>
                                    :
                                    <Button variant={'contained'} color={'secondary'}
                                            disabled={isEnabled === false} onClick={e => this.createRoom('me')}>Broadcast</Button>
                            }
                        </Grid>

                        <Grid item >
                            <ButtonGroup>
                            <Button endIcon={this.state.enabled.video === true ? <Check /> : <Unchecked />}
                                    variant={'contained'}
                                    color={this.state.enabled.video === true ? 'secondary' : 'primary'}
                                    onClick={e => this.toggleCamMic('video')}>Camera</Button>
                            <Button endIcon={this.state.enabled.audio === true ? <Check /> : <Unchecked />}
                                    variant={'contained'}
                                    color={this.state.enabled.audio === true ? 'secondary' : 'primary'}
                                    onClick={e => this.toggleCamMic('audio')}>Mic</Button>
                            <Button endIcon={this.state.enabled.screen === true ? <Check /> : <Unchecked />}
                                    variant={'contained'}
                                    color={this.state.enabled.screen === true ? 'secondary' : 'primary'}
                                    onClick={e => this.shareScreen()}>Screen</Button>
                            </ButtonGroup>
                        </Grid>

                        <Divider orientation="vertical" style={{flexGrow:1}} />

                        <TextField
                            size={'small'}
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

                {this.camStream || this.screenStream ?
                    <DragBox key={'mystream'} onClose={e => this.hangUp()} >
                        <video controls style={{height: 250, width: '100%'}} autoPlay ref={this.myVideo} muted={true}/>
                    </DragBox> : ''}
                {this.state.roomsViewing.map((o, i) => <RemoteVideo key={o.roomId} roomId={o.roomId} db={this.db} localStream={this.screenStream || this.camStream} peerConnection={o.peer}/>)}
            </React.Fragment>
        );
    }
}

export default withSnackbar(Room);
