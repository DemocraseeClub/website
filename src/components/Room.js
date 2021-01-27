import React from "react";
import DragBox from "./DragBox";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import {withStyles} from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Toolbar from "@material-ui/core/Toolbar";
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';

const configuration = {
    iceServers: [
        {
            urls: [
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',
            ],
        },
    ],
    iceCandidatePoolSize: 10
};

class Room extends React.Component {

    constructor(p) {
        super(p);
        this.state = {
            myRoom: null,
            sharing:{},
            roomsViewing: [],
            localStream: null,
            remoteStream: null,
            roomFieldText : ''
        }
        this.db = window.firebase.firestore();
        this.peerConnection = null;
        this.senders = []
        this.userVideo = React.createRef();
        this.partnerVideo = React.createRef();
    }

    async enableCamMic(e) {
        let stream = await window.navigator.mediaDevices.getUserMedia({video: true, audio: true});
        let remoteStream = new MediaStream();
        this.setState({localStream: stream, remoteStream: remoteStream}, e => {
            this.userVideo.current.srcObject = this.state.localStream;
            if (this.partnerVideo.current) this.partnerVideo.current.srcObject = this.state.remoteStream;
        })
    }

    shareScreen() {
        navigator.mediaDevices.getDisplayMedia({cursor: true}).then(stream => {

            const screenTrack = stream.getTracks()[0];
            let vidsender = this.senders.find(sender => sender.track.kind === 'video');
            if (vidsender) {
                vidsender.replaceTrack(screenTrack);
                screenTrack.onended = function () {
                    this.senders.find(sender => sender.track.kind === "video").replaceTrack(this.userStream.current.getTracks()[1]);
                }
            }
            let st = {localStream: stream};
            if (!this.state.remoteStream) {
                st.remoteStream = new MediaStream();
            }
            this.setState(st, e => {
                this.userVideo.current.srcObject = this.state.localStream;
            })
        })
    }

    async createRoom() {
        const roomRef = await this.db.collection('rooms').doc();

        console.log('Create PeerConnection with configuration: ', configuration);
        this.peerConnection = new RTCPeerConnection(configuration);
        this.registerPeerConnectionListeners();

        this.state.localStream.getTracks().forEach(track => {
            console.log(track);
            this.senders.push(this.peerConnection.addTrack(track, this.state.localStream));
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
        this.setState({myRoom: roomRef.id})
        console.log(`New room created with SDP offer. Room ID: ${roomRef.id}`);

        this.peerConnection.addEventListener('track', event => {
            console.log('Got remote track:', event.streams[0]);
            event.streams[0].getTracks().forEach(track => {
                console.log('Add a track to the remoteStream:', track);
                this.state.remoteStream.addTrack(track);
            });
        });

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
                    console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
                    await this.peerConnection.addIceCandidate(new RTCIceCandidate(data));
                }
            });
        });
        // Listen for remote ICE candidates above
    }

    joinRoom() {
        let newRoom = this.state.roomFieldText;
        let rooms = {...this.state.roomsViewing}
        if (typeof rooms[newRoom] === 'undefined') {
            rooms[newRoom] = null;
            this.setState({roomsViewing: rooms}, e=> {
                this.joinRoomById(newRoom);
                this.setState({roomFieldText:''})
            })
        } else {
            console.log('room already exists');
        }
    }

    async joinRoomById(room) {
        const roomRef = this.db.collection('rooms').doc(room);
        const roomSnapshot = await roomRef.get();
        console.log('Got room:', roomSnapshot.exists);

        if (roomSnapshot.exists) {
            console.log('Create PeerConnection with configuration: ', configuration);
            this.peerConnection = new RTCPeerConnection(configuration);
            this.registerPeerConnectionListeners();
            this.state.localStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.state.localStream);
            });

            // Code for collecting ICE candidates below
            const calleeCandidatesCollection = roomRef.collection('calleeCandidates');
            this.peerConnection.addEventListener('icecandidate', event => {
                if (!event.candidate) {
                    console.log('Got final candidate!');
                    return;
                }
                console.log('Got candidate: ', event.candidate);
                calleeCandidatesCollection.add(event.candidate.toJSON());
            });
            // Code for collecting ICE candidates above

            this.peerConnection.addEventListener('track', event => {
                console.log('Got remote track:', event.streams[0]);
                event.streams[0].getTracks().forEach(track => {
                    console.log('Add a track to the remoteStream:', track);
                    this.state.remoteStream.addTrack(track);
                });
            });

            // Code for creating SDP answer below
            const offer = roomSnapshot.data().offer;
            console.log('Got offer:', offer);
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await this.peerConnection.createAnswer();
            console.log('Created answer:', answer);
            await this.peerConnection.setLocalDescription(answer);

            const roomWithAnswer = {
                answer: {
                    type: answer.type,
                    sdp: answer.sdp,
                },
            };
            await roomRef.update(roomWithAnswer);
            // Code for creating SDP answer above

            // Listening for remote ICE candidates below
            roomRef.collection('callerCandidates').onSnapshot(snapshot => {
                snapshot.docChanges().forEach(async change => {
                    if (change.type === 'added') {
                        let data = change.doc.data();
                        console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
                        await this.peerConnection.addIceCandidate(new RTCIceCandidate(data));
                    }
                });
            });
            // Listening for remote ICE candidates above
        }
    }

    async hangUp(e) {
        const tracks = this.state.localStream.current.srcObject.getTracks();
        tracks.forEach(track => {
            track.stop();
        });

        if (this.state.remoteStream) {
            this.state.remoteStream.getTracks().forEach(track => track.stop());
        }

        if (this.peerConnection) {
            this.peerConnection.close();
        }

        this.userVideo.current.srcObject = null;
        this.partnerVideo.current.srcObject = null;

        // Delete room on hangup
        if (this.state.myRoom) {
            const roomRef = this.db.collection('rooms').doc(this.state.myRoom);
            const calleeCandidates = await roomRef.collection('calleeCandidates').get();
            calleeCandidates.forEach(async candidate => {
                await candidate.ref.delete();
            });
            const callerCandidates = await roomRef.collection('callerCandidates').get();
            callerCandidates.forEach(async candidate => {
                await candidate.ref.delete();
            });
            await roomRef.delete();
        }
    }

    registerPeerConnectionListeners() {
        this.peerConnection.addEventListener('icegatheringstatechange', () => {
            console.log(
                `ICE gathering state changed: ${this.peerConnection.iceGatheringState}`);
        });

        this.peerConnection.addEventListener('connectionstatechange', () => {
            console.log(`Connection state change: ${this.peerConnection.connectionState}`);
        });

        this.peerConnection.addEventListener('signalingstatechange', () => {
            console.log(`Signaling state change: ${this.peerConnection.signalingState}`);
        });

        this.peerConnection.addEventListener('iceconnectionstatechange ', () => {
            console.log(
                `ICE connection state change: ${this.peerConnection.iceConnectionState}`);
        });
    }

    render() {
        const {classes} = this.props;
        return (
            <React.Fragment>
                <Toolbar>
                        {!this.state.localStream ?
                            <Grid container justify="center" alignItems="center" spacing={4}>
                                <label>Enable: </label>
                                <ButtonGroup size="small" aria-label="small outlined button group">
                                    <Button size="small" onClick={e => this.enableCamMic()}>Camera</Button>
                                    <Button size="small" onClick={e => this.enableCamMic()}>Mic</Button>
                                    <Button size="small" onClick={e => this.shareScreen()}>Screen</Button>
                                </ButtonGroup>
                            </Grid>
                            :
                            <Grid container justify={'space-between'} alignItems="center">
                                {this.state.myRoom ? <small>My Room ID: {this.state.myRoom}</small> : <Button variant={'filled'} onClick={e => this.createRoom()}>Broadcast</Button>}
                                <Divider className={classes.divider} orientation="vertical" />

                                <div>
                                    <TextField
                                        label="Enter Room ID"
                                        color="secondary"
                                        value={this.roomFieldText}
                                        onChange={e => this.setState({roomFieldText:e.target.value})}
                                    />
                                    <Button onClick={e => this.joinRoom()}>Connect</Button>
                                </div>

                                {this.state.roomsViewing.length > 0 ?
                                    <Button variant={'outline'} onClick={e => this.hangUp()}>Hangup</Button>
                                    :
                                    <Button variant={'outline'} onClick={e => this.hangUp()}>Stop</Button>
                                }
                            </Grid>
                        }
                </Toolbar>
                {this.state.localStream || this.state.remoteStream ?
                    <DragBox>
                    {this.state.localStream ? <video controls style={{height: 250, width: '100%'}} autoPlay ref={this.userVideo} muted={true}/> : false}
                    {this.state.remoteStream && this.state.roomsViewing.length > 0 ? <video controls style={{height: 250, width: '100%'}} autoPlay ref={this.partnerVideo}/> : false }
                </DragBox> : ''}
            </React.Fragment>
        );
    }

}


const useStyles = theme => ({
    root: {
        width: '100%',
    }
});

export default withStyles(useStyles, {withTheme: true})(Room);
