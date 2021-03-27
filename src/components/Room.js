import React from "react";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Grid from "@material-ui/core/Grid";
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Badge from '@material-ui/core/Badge';
import RemoteVideo from "./RemoteVideo";
import Config from "../Config";
import {withSnackbar} from 'notistack';
import VideoElement from "./VideoElement";
import VideoCamIcon from '@material-ui/icons/Videocam';
import MicIcon from '@material-ui/icons/Mic';
import ScreenShareIcon from '@material-ui/icons/ScreenShare';
import {getParam} from '../Util/WindowUtils';
import VisibilityIcon from "@material-ui/icons/Visibility";
import ShareIcon from "@material-ui/icons/Share";
import PasswordIcon from "@material-ui/icons/VpnKey";

const VideoStreamMerger = require('video-stream-merger')


class Room extends React.Component {

    constructor(p) {
        super(p);
        this.state = {
            myRoom: null,
            showRoomId : false,
            enabled: {'video': false, 'audio': false, 'screen': false},
            startingRoom:false,
            roomsViewing: [],
            myStream:null,
            viewerStreams: [],
            viewerCount: [],
            roomFieldText: '',
            listeners:[]
        }

        this.userId = window.navigator.userAgent.substr(window.navigator.userAgent.lastIndexOf(' ') + 1);
        this.allConnections = {};
        this.screenStream = null;
        this.camStream = null;
        this.myStream = null;
    }

    componentDidMount() {
        let roomId = getParam('roomId', document.location.search);
        if (roomId.length === 20) {
            this.setState({roomFieldText:roomId});
            document.getElementById('roomIdField').scrollIntoView({block:'start', behavior:'smooth'})
            this.props.enqueueSnackbar(`Enable your Cam/Mic/Screen & click connect when you are ready to join`, {variant:'success', persist:true});
        }
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
        } else {
            this.myStream = stream;
            this.setState({myStream:stream});
            return false;
        }

        stream.onremovetrack = function(event) {
            // TODO: recursive call?
            console.log("MY STREAM REMOVE", event);
        };
        stream.onaddtrack = function(event) {
            // TODO: recursive call?
            console.log("MY STREAM ADD", event);
        };

        for (let p in this.allConnections) {
            let tracks = stream.getTracks();
            console.log("adding myStream to peer in roomID: " + p, tracks);
            tracks.forEach(track => {
                this.allConnections[p].addTrack(track, stream);
            });
        }
        this.myStream = stream;
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
            // TODO: remove from peerConnection
        } else {
            let stream = await navigator.mediaDevices.getDisplayMedia({cursor: true});
            this.screenStream = stream;
        }
        this.setState({enabled: enable}, () => this.displayLocalStreams());
    }

    setMuting(pc, muting) {
        let senderList = pc.getSenders();

        senderList.forEach(sender => {
            sender.track.enabled = !muting;
        })
    }

    createPeerConnection(roomRef) {
        let peerConnection = new RTCPeerConnection(Config.peerConfig);

        peerConnection.addEventListener('icegatheringstatechange', event => {
            if (peerConnection.iceGatheringState === 'complete') {
                console.log(`ICE gathering: ${peerConnection.iceGatheringState}`, event);
            }
        });

        peerConnection.addEventListener('isolationchange', event => {
            console.log('A track is isolated if its content cannot be accessed by the owning document due to lack of authentication or if the track comes from a cross-origin source.', event);
        });

        peerConnection.addEventListener('icecandidateerror', event => {
            console.log('CONNECTION ERROR: ' + event.errorText, event);
        });

        peerConnection.addEventListener('datachannel', event => {
            console.log('NEW DATACHANNEL!', event);
        });

        peerConnection.onaddstream = event => {
            // TODO add to viewerStreams?
            console.log("ON ADDED STREAM createRoom - remote stream", event);
        };

        peerConnection.ontrack = event => {
            // TODO add to viewerStreams?
            console.log("ON TRACK STREAM createRoom - remote stream", event);
        };

        peerConnection.addEventListener('onaddstream', event => {
            // TODO add to viewerStreams?
            console.log("ON LISTEN ADDED STREAM createRoom - remote stream", event);
        });

        peerConnection.addEventListener('track', event => {
            // TODO add to viewerStreams?
            console.log('Got peerconnection track!!!: ', event);
        });

        const auxList1 = roomRef.onSnapshot(async snapshot => {
            const data = snapshot.data();
            console.log("ONSNAP", data);
            if (!data) return false;
            if (data.ownerId === this.userId) {
                console.log("update viewerCount with my userID: " + this.userId);
                this.setState({viewerCount:data.viewerIds.length});
                // TODO: loop over viewerIds and display names
            }
            if (!peerConnection.currentRemoteDescription && data.answer) {
                console.log('Got remote description: ', data.answer);
                const rtcSessionDescription = new RTCSessionDescription(data.answer);
                await peerConnection.setRemoteDescription(rtcSessionDescription);
            }
        });

        // Listen for remote ICE candidates below
        const auxList2 =  roomRef.collection('calleeCandidates').onSnapshot(snapshot => {
            snapshot.docChanges().forEach(async change => {
                if (change.type === 'added') {
                    let data = change.doc.data();
                    console.log(`Got new remote calleeCandidates:`, data);
                    await peerConnection.addIceCandidate(new RTCIceCandidate(data));
                } else {
                    console.log('calleeCandidate change type ' + change.type, change);
                }
            });
        });
        // Listen for remote ICE candidates above

        // Code for collecting ICE candidates below
        const callerCandidatesCollection = roomRef.collection('callerCandidates');
        peerConnection.addEventListener('icecandidate', event => {
            if (!event.candidate) {
                console.log('Got final candidate!', event);
                return;
            }
            console.log('Got candidate: ', event.candidate);
            callerCandidatesCollection.add(event.candidate.toJSON());
        });
        // Code for collecting ICE candidates above

        let newState = {listeners:[...this.state.listeners]};
        newState.listeners.concat([auxList1, auxList2]);

        if (this.myStream) {
            let tracks = this.myStream.getTracks();
            console.log("adding local stream to " + roomRef.id, tracks);
            tracks.forEach(track => {
                peerConnection.addTrack(track, this.myStream);
            });
            newState.myStream = this.myStream;
        }
        this.setState(newState)

        return peerConnection;
    }

    async createRoom() {
        this.setState({startingRoom:true}); // because this function can lag and we need to disable the button

        const roomRef = await window.fireDB.collection('rooms').doc();

        const peerConnection = this.createPeerConnection(roomRef);

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        this.allConnections[roomRef.id] = peerConnection;
        console.log('Created offer:', offer);

        const roomWithOffer = {'offer': {type: offer.type, sdp: offer.sdp}, ownerId:this.userId, viewerIds:[]}; // sdp:peerConnection.localDescription
        await roomRef.set(roomWithOffer);

        this.setState({myRoom: roomRef.id});
        this.props.enqueueSnackbar(`Share your room ID - ${roomRef.id} - with anyone you want to view your broadcast`, {variant:'success'});
    }

    async joinRoom() {
        let newRoomId = this.state.roomFieldText;
        if (newRoomId === this.state.myRoom) {
            return console.log("no reason to join your own room");
        }

        this.setState({startingRoom:true}); // because this function can lag and we need to disable the button

        let rooms = [...this.state.roomsViewing];
        let i = rooms.findIndex(o => o.roomId === newRoomId);
        if (i > -1) {
            return console.log('you are already viewing this room');
        }

        const roomRef = window.fireDB.collection("rooms").doc(newRoomId);
        let roomData = await roomRef.get();
        if (!roomData.exists) {
            return console.log("Room is broken:", roomData);
        }
        roomData = roomData.data();
        console.log("Got remote room:", roomData);

        const peerConnection = this.createPeerConnection(roomRef);

        roomRef.update({viewerIds:window.firebase.firestore.FieldValue.arrayUnion(this.userId)});

        // Code for collecting ICE candidates below
        const calleeCandidatesCollection = roomRef.collection("calleeCandidates");
        peerConnection.addEventListener("icecandidate", (event) => {
            if (!event.candidate) {
                console.log("Got final calleeCandidate!", event);
                return;
            } else {
                console.log("Got calleeCandidate: ", event.candidate);
            }
            calleeCandidatesCollection.add(event.candidate.toJSON());
        });
        // Code for collecting ICE candidates above

        let room = {roomId: newRoomId, peer:peerConnection, stream:new MediaStream()};
        console.log('adding room', room);
        rooms.push(room);

        this.setState({roomsViewing: rooms, roomFieldText: '', startingRoom:false})

    }

    handleHangUp(id) { // TODO: respond to room owner hanging up on viewers
        if (id === this.state.myRoom) {
            this.props.enqueueSnackbar('Your room was closed');
        } else {
            let rooms = [...this.state.roomsViewing];
            let i = rooms.findIndex(o => o.roomId === id);
            if (i > -1) {
                rooms.splice(i, 1);
                this.setState({roomsViewing: rooms})
                this.props.enqueueSnackbar('This room was closed');
            } else {
                console.log('room already hung up');
            }
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

        if(this.state.listeners.length > 0) {
            this.state.listeners.forEach(o => o());
        }

        for(let roomId in this.allConnections) {
            this.allConnections[roomId].close();
        }
        this.allConnections = {};

        if (this.state.myRoom) {
            const roomRef = window.fireDB.collection('rooms').doc(this.state.myRoom);
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
        this.myStream = null;
        this.setState({myRoom:null, startingRoom:false, myStream:null, enabled: {'video': false, 'audio': false, 'screen': false}});
    }

    copyRoomUrl() {
        let url = `${document.location.href}${document.location.href.indexOf('?') > -1 ? '&' : '?'}roomId=${this.state.myRoom}`;
        navigator.clipboard.writeText(url);
        this.props.enqueueSnackbar(`Your room URL has been copied to your clipboard`, {variant:'success'});
    }

    render() {
        const isEnabled = this.state.enabled.video === true || this.state.enabled.audio === true || this.state.enabled.screen === true;
        const hasVideos = (this.myStream || this.state.viewerStreams.length > 0 || this.state.roomsViewing.length > 0);

        return (
            <Box p={1}>
                    <Grid container justify={'space-between'} alignItems="center" spacing={2} alignContent={'center'}>

                    { (this.state.myRoom) ?
                        <React.Fragment>
                            <Grid item>
                                <Button variant="contained" color="primary" onClick={e => this.hangUp()}>Hangup</Button>
                            </Grid>
                            <Grid item ><Badge showZero={true} color="error" badgeContent={this.state.viewerCount} ><VisibilityIcon /></Badge></Grid>
                            <Grid item>
                                <Button variant="contained" color="primary"
                                        onClick={() => {
                                            if (!this.state.showRoomId) this.copyRoomUrl();
                                            this.setState({showRoomId:!this.state.showRoomId})
                                        }}
                                        endIcon={<PasswordIcon color={this.state.showRoomId === true ?  'error' : 'inherit'} />}
                                >{this.state.showRoomId === true ? this.state.myRoom : ' **** '}</Button>
                            </Grid>
                            <Grid item>
                                <ShareIcon onClick={() => this.copyRoomUrl()} />
                            </Grid>
                        </React.Fragment>
                        :
                        <Grid item>
                        <Button variant="contained" color="primary" disabled={isEnabled === false || this.state.startingRoom} onClick={e => this.createRoom('me')}>Broadcast</Button>
                        </Grid>
                    }

                        <Grid item style={{flexGrow:1}} >
                            <ButtonGroup variant="contained" color="primary" aria-label="broadcast options" style={{marginLeft:10}}>
                                <Button endIcon={<VideoCamIcon color={this.state.enabled.video === true ?  'error' : 'inherit'} />}
                                        onClick={e => this.toggleCamMic('video')}>Cam</Button>
                                <Button endIcon={<MicIcon color={this.state.enabled.audio === true ?  'error' : 'inherit'} />}
                                        onClick={e => this.toggleCamMic('audio')}>Mic</Button>
                                <Button endIcon={<ScreenShareIcon color={this.state.enabled.screen === true ? 'error' : 'inherit'} />}
                                        onClick={e => this.shareScreen()}>Screen</Button>
                            </ButtonGroup>
                        </Grid>

                        <Grid item>
                            <TextField
                                size={'small'}
                                margin={'dense'}
                                label="Enter Room ID"
                                variant={'filled'}
                                color="secondary"
                                inputProps={{maxlength:20}}
                                id={'roomIdField'}
                                value={this.state.roomFieldText}
                                onChange={e => this.setState({roomFieldText: e.target.value})}
                                InputProps={{
                                    endAdornment: (
                                        <Button onClick={() => this.joinRoom()} variant={'contained'}
                                                color={'secondary'}
                                                style={this.state.roomFieldText.length !== 20 ? {} : {backgroundColor:'#D83933', color:'#ffffff'}}
                                                disabled={this.state.roomFieldText.length !== 20 || this.state.startingRoom === true}>Connect</Button>
                                    )
                                }}
                            />
                        </Grid>

                    </Grid>
                {hasVideos === false ? '' :
                <div className={this.props.classes.hScrollContainer}>
                    <div className={this.props.classes.hScroller} >
                        {this.myStream ?
                            <div className={this.props.classes.hScrollItem} ><VideoElement roomId={this.state.myRoom} stream={this.myStream} muted={true} /></div> : ''}
                        {this.state.roomsViewing.map((o, i) =>
                            <div className={this.props.classes.hScrollItem} key={o.roomId+i} >
                                <label>{o.roomId}</label>
                                {/* <VideoElement roomId={o.roomId}
                                              roomId={o} myRoomId={this.state.myRoom} stream={o.stream}  /> */}
                                  <RemoteVideo roomId={o.roomId} myRoomId={this.state.myRoom}> </RemoteVideo>
                            </div>
                        )}
                    </div>
                </div> }
            </Box>
        );
    }
}

export default withSnackbar(Room);
