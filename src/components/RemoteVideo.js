import React from "react";
import VideoElement from "./VideoElement";
import PropTypes from "prop-types";
import Config from "../Config";

class RemoteVideo extends React.Component {

    constructor(p) {
        super(p);
        this.state = {remoteStream : p.stream};
        this.db = p.db;
    }

    componentDidMount() {
        this.joinRoomById(this.props.roomId);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!this.props.roomId && prevProps.roomId) {
            this.hangUp();
        }
    }

    async componentWillUnmount() {
        await this.hangUp();
    }

    async joinRoomById(room) {
        if (!this.props.db) {
            this.db = window.firebase.firestore();
        }
        const roomRef = this.db.collection('rooms').doc(room);
        const roomSnapshot = await roomRef.get();
        console.log('Got room:', roomSnapshot.exists, roomRef);
        if (!roomSnapshot.exists) return false;

        this.peerConnection = this.createPeerConnection();

        this.peerConnection.onaddstream = (event => {
            console.log("ON ADDED STREAM", event);
            this.setState({remoteStream:event.stream})
        });

        // Code for collecting ICE candidates below
        const calleeCandidatesCollection = roomRef.collection('calleeCandidates');
        this.peerConnection.addEventListener('icecandidate', event => {
            if (!event.candidate) {
                console.log('Got final icecandidate!', event);
                return;
            }
            console.log('Got candidate: ', event.candidate);
            calleeCandidatesCollection.add(event.candidate.toJSON());
        });
        // Code for collecting ICE candidates above

        this.peerConnection.addEventListener('track', event => {
            let remoteStream = this.state.remoteStream; // WARN: maybe clone this ?
            console.log('Got presenter track:', event.streams[0]);
            event.streams[0].getTracks().forEach(track => {
                console.log('Add a track to the remoteStream:', track);
                remoteStream.addTrack(track);
            });
            this.setState({remoteStream:remoteStream});
        });

        this.peerConnection.ontrack = event => {
            let remoteStream = this.state.remoteStream; // WARN: maybe clone this ?
            console.log('Got presenter track:', event.streams[0]);
            event.streams[0].getTracks().forEach(track => {
                console.log('Add a track to the remoteStream:', track);
                remoteStream.addTrack(track);
            });
            this.setState({remoteStream:remoteStream});
        }

        // Code for creating SDP answer below
        const offer = roomSnapshot.data().offer;
        console.log('Got offer:', offer);
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await this.peerConnection.createAnswer();
        console.log('Created answer:', answer);
        await this.peerConnection.setLocalDescription(answer);

        const roomWithAnswer = {
            answer: {type: answer.type, sdp: answer.sdp}
        };
        await roomRef.update(roomWithAnswer);
        // Code for creating SDP answer above

        // Listening for remote ICE candidates below
        roomRef.collection('callerCandidates').onSnapshot(snapshot => {
            snapshot.docChanges().forEach(async change => {
                if (change.type === 'added') {
                    let data = change.doc.data();
                    console.log(`Got new remote callerCandidates: ${JSON.stringify(data)}`);
                    await this.peerConnection.addIceCandidate(new RTCIceCandidate(data));
                }
            });
        });
        // Listening for remote ICE candidates above

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


        if (this.state.remoteStream) {
            console.log("adding remote stream");
            this.state.remoteStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, this.state.remoteStream);
            });
        }

        return peerConnection;
    }


    async hangUp() {
        console.log("HANGING UP REMOTE!");
        if (this.remoteStream) {
            this.remoteStream.getTracks().forEach(track => track.stop());
        }

        if (this.peerConnection) {
            this.peerConnection.close();
        }

        this.setState({remoteStream:null});
    }

    render() {
        return (
            <VideoElement stream={this.state.remoteStream} roomId={this.props.roomId} />
        );
    }

}

RemoteVideo.propTypes = {
    peerConnection: PropTypes.object.isRequired,
    roomId : PropTypes.string.isRequired
};


export default RemoteVideo;
