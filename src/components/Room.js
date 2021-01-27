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
            screenStream: null,
            camStream: null,
            roomFieldText: ''
        }

        try {
            this.db = window.firebase.firestore();
        } catch (e) {
            this.db = e => console.log(e);
        }

        this.peerConnection = null;

        this.senders = [];

        this.myVideo = React.createRef();
    }

    async componentWillUnmount() {
        await this.hangUp();
    }

    displayLocalStreams() {
        if (this.state.camStream && this.state.screenStream) {
            // TODO: merge
            this.myVideo.current.srcObject = this.state.camStream;
        } else if (this.state.camStream) {
            this.myVideo.current.srcObject = this.state.camStream;
        } else if (this.state.screenStream) {
            this.myVideo.current.srcObject = this.state.screenStream;
        }

    }

    async toggleCamMic(type) {
        let enable = {video: this.state.enabled.video === true, audio: this.state.enabled.audio === true};
        enable[type] = !this.state.enabled[type];
        if (enable[type] === false) {
            this.setState({enabled: enable});
        } else {
            let stream = await window.navigator.mediaDevices.getUserMedia(enable);
            this.setState({camStream: stream, enabled: enable}, () => this.displayLocalStreams());
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

            this.setState({screenStream: stream, enabled: enable}, () => this.displayLocalStreams());
        }
    }

    async createRoom(owner) {
        const roomRef = await this.db.collection('rooms').doc();

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
        if (owner === 'me') {
            this.state.camStream.getTracks().forEach(track => {
                this.senders.push(peerConnection.addTrack(track, this.state.camStream));
            });
            this.setState({myRoom: roomRef.id});
            this.peerConnection = peerConnection;
        }

        return peerConnection;

    }

    broadcastMedia() {
        let remoteStream = this.state.roomsViewing[this.state.roomsViewing.length - 1];

        this.peerConnection.addEventListener('track', event => {
            console.log('Got remote track:', event.streams[0]);
            event.streams[0].getTracks().forEach(track => {
                console.log('Add a track to the remoteStream:', track);
                this.state.remoteStream.addTrack(track);
            });
        });
    }

    joinRoom() {
        let newRoomId = this.state.roomFieldText;
        let rooms = [...this.state.roomsViewing];
        let i = rooms.find(o => o.roomId === newRoomId);
        if (!i) {
            let room = {roomId: newRoomId, stream: new MediaStream(), peer: null};
            room.peer = (newRoomId === this.state.myRoom) ? this.peerConnection : this.createRoom('remote')
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
            if (this.state[cam]) {
                const tracks = this.state[cam].current.srcObject.getTracks();
                tracks.forEach(track => {
                    track.stop();
                });
            }
        })

        if (this.peerConnection) {
            this.peerConnection.close();
        }

        this.myVideo.current.srcObject = null;

        cams = ['myRoom'];
        for (let i = 0; i < cams.length; i++) {
            if (this.state[cams[i]]) {
                const roomRef = this.db.collection('rooms').doc(this.state[cams[i]]);
                const calleeCandidates = await roomRef.collection('calleeCandidates').get();
                for (let l = 0; i < calleeCandidates.length; l++) {
                    await calleeCandidates[l].ref.delete();
                }
                const callerCandidates = await roomRef.collection('callerCandidates').get();
                for (let l = 0; i < callerCandidates.length; l++) {
                    await callerCandidates[l].ref.delete();
                }
                await roomRef.delete();
            }
        }
    }

    render() {
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
                                    <Button variant={'contained'} color={'secondary'} onClick={e => this.createRoom('me')}>Broadcast</Button>
                            }
                        </Grid>

                        <Grid item >
                            <ButtonGroup>
                            <Button endIcon={this.state.enabled.video ? <Check /> : <Unchecked />}
                                    variant={'contained'}
                                    color={this.state.enabled.video ? 'secondary' : 'primary'}
                                    onClick={e => this.toggleCamMic('video')}>Camera</Button>
                            <Button endIcon={this.state.enabled.audio ? <Check /> : <Unchecked />}
                                    variant={'contained'}
                                    color={this.state.enabled.video ? 'secondary' : 'primary'}
                                    onClick={e => this.toggleCamMic('audio')}>Mic</Button>
                            <Button endIcon={this.state.enabled.screen ? <Check /> : <Unchecked />}
                                    variant={'contained'}
                                    color={this.state.enabled.video ? 'secondary' : 'primary'}
                                    onClick={e => this.shareScreen()}>Screen</Button>
                            </ButtonGroup>
                        </Grid>

                        <Divider orientation="vertical" style={{flexGrow:1}} />
                        
                        <TextField
                            size={'small'}
                            label="Enter Room ID"
                            variant={'filled'}
                            color="secondary"
                            value={this.roomFieldText}
                            disabled={this.roomFieldText === ''}
                            onChange={e => this.setState({roomFieldText: e.target.value})}
                            InputProps={{
                                endAdornment: (
                                    <Button onClick={e => this.joinRoom()} variant={'contained'} color={'secondary'} >Connect</Button>
                                )
                            }}
                        />

                    </Grid>
                </Toolbar>

                {this.state.camStream || this.state.screenStream ?
                    <DragBox key={'mystream'} onClose={e => this.hangUp()}>
                        <video controls style={{height: 250, width: '100%'}} autoPlay ref={this.myVideo} muted={true}/>
                    </DragBox> : ''}
                {this.state.roomsViewing.map((o, i) =>
                    <RemoteVideo roomId={o.roomId} db={this.db} peerConnection={o.peer}/>)}
            </React.Fragment>
        );
    }
}

export default withSnackbar(Room);
