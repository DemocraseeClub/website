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
            viewers: [],
            roomFieldText: '',
            listener:[]

        }

        this.peerConnection = null;
        this.screenStream = null;
        this.camStream = null;

        this.castBtnRef = React.createRef('');
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
        if(this.state.listener.length > 0) {
            this.state.listener[0]();
            this.state.listener[1]();
        }

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
        this.setState({startingRoom:true}); // because this function can lag and we need to disable the button

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

        const roomWithOffer = {'offer': {type: offer.type, sdp: offer.sdp}, viewers:0, roomsViewing: []};
        await roomRef.set(roomWithOffer);

        /*
         this.peerConnection.addEventListener('track', event => {
             console.log('Got viewer track: ', event);
             console.log('event streams: ', event.streams);
             let rooms = [...this.state.viewers];
             rooms.push({roomId: this.state.myRoom, stream: event.streams[0]});
             this.setState({viewers: rooms})
         });
         this.peerConnection.ontrack = event => {
             console.log('Got viewer track2:', event);
             console.log('event streams: ', event.streams);
             let rooms = [...this.state.viewers];
             rooms.push({roomId: this.state.myRoom, stream: event.streams[0]});
             this.setState({viewers: rooms})
         }
         */

        const auxList1 = roomRef.onSnapshot(async snapshot => {

            const data = snapshot.data();
            console.log(data);
            if (!this.peerConnection.currentRemoteDescription && data && data.answer) {
                console.log('Got remote description: ', data.answer);
                const rtcSessionDescription = new RTCSessionDescription(data.answer);
                await this.peerConnection.setRemoteDescription(rtcSessionDescription);
            }

            let viewers = snapshot.data().roomsViewing;
            let auxRoomsViewing = this.state.roomsViewing.map((r) => r.roomId)
            for(let i = viewers.length - 1; i>=0 ;i--){
                if(auxRoomsViewing.indexOf(viewers[i])!==-1)
                    viewers.splice(i,1);
            }
            this.setState({viewers: viewers})
        });
        // Listening for remote session description above

        // Listen for remote ICE candidates below
        const auxList2 =  roomRef.collection('calleeCandidates').onSnapshot(snapshot => {
            snapshot.docChanges().forEach(async change => {
                if (change.type === 'added') {
                    let data = change.doc.data();
                    console.log(`Got new remote calleeCandidates: ${JSON.stringify(data)}`);
                    await this.peerConnection.addIceCandidate(new RTCIceCandidate(data));
                }
            });
        });
        // Listen for remote ICE candidates above


        this.setState({myRoom: roomRef.id, listener: [auxList1, auxList2]});

        this.props.enqueueSnackbar(`Share your room ID - ${roomRef.id} - with anyone you want to view your broadcast`, {variant:'success'});
        return this.peerConnection;
    }

    async joinRoom() {
        if (!this.db) {
            this.db = window.firebase.firestore();
        }
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

    handleHangUp(id) {
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
        this.setState({myRoom:null, startingRoom:false, myStream:null, enabled: {'video': false, 'audio': false, 'screen': false}});
    }

    copyRoomUrl() {
        let url = `${document.location.href}${document.location.href.indexOf('?') > -1 ? '&' : '?'}roomId=${this.state.myRoom}`;
        navigator.clipboard.writeText(url);
        this.props.enqueueSnackbar(`Your room URL has been copied to your clipboard`, {variant:'success'});
    }

    render() {
        const isEnabled = this.state.enabled.video === true || this.state.enabled.audio === true || this.state.enabled.screen === true;
        const hasVideos = (this.state.myStream || this.state.viewers.length > 0 || this.state.roomsViewing.length > 0);

        return (
            <Box p={1}>
                    <Grid container justify={'space-between'} alignItems="center" spacing={2} alignContent={'center'}>

                    { (this.state.myRoom) ?
                        <React.Fragment>
                            <Grid item>
                                <Button variant="contained" color="primary" onClick={e => this.hangUp()}>Hangup</Button>
                            </Grid>
                            <Grid item ><Badge showZero={true} color="error" badgeContent={this.state.viewers.length} ><VisibilityIcon /></Badge></Grid>
                            <Grid item>
                                <Button variant="contained" color="primary"
                                        onClick={() => {
                                            if (!this.state.showRoomId) this.copyRoomUrl();
                                            this.setState({showRoomId:!this.state.showRoomId})
                                        }}
                                        endIcon={<PasswordIcon color={this.state.showRoomId === true ?  'error' : 'default'} />}
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
                                                disabled={this.state.roomFieldText.length !== 20}>Connect</Button>
                                    )
                                }}
                            />
                        </Grid>

                    </Grid>
                {hasVideos === false ? '' :
                <div className={this.props.classes.hScrollContainer}>
                    <div className={this.props.classes.hScroller} >
                        {this.state.myStream ?
                            <div className={this.props.classes.hScrollItem} ><VideoElement roomId={this.state.myRoom} stream={this.state.myStream} muted={true} viewers={this.state.viewers.length} db={this.db} /></div> : ''}
                        {this.state.viewers.map((o, i) =>
                            <div className={this.props.classes.hScrollItem} key={o+i} ><RemoteVideo roomId={o} myRoomId={this.state.myRoom} stream={new MediaStream()} db={this.db} handleHangUp={id => this.handleHangUp(id)} /></div>)}
                        {this.state.roomsViewing.map((o, i) =>
                            <div className={this.props.classes.hScrollItem} key={o.roomId+i} ><RemoteVideo roomId={o.roomId} myRoomId={this.state.myRoom} stream={o.stream} db={this.db} handleHangUp={id => this.handleHangUp(id)} /></div>)}
                    </div>
                </div> }
            </Box>
        );
    }
}

export default withSnackbar(Room);
