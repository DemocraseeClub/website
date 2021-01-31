import React from "react";
import Typography from "@material-ui/core/Typography";
import VideoElement from "./VideoElement";
import PropTypes from "prop-types";

class RemoteVideo extends React.Component {

    constructor(p) {
        super(p);
        this.partnerVideo = React.createRef();
        this.state = {remoteStream : new MediaStream()};
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

        // Code for collecting ICE candidates below
        const callerCandidatesCollection = roomRef.collection('callerCandidates');
        this.props.peerConnection.addEventListener('icecandidate', event => {
            if (!event.candidate) {
                console.log('Got final candidate!');
                return;
            }
            console.log('Got candidate: ', event.candidate);
            callerCandidatesCollection.add(event.candidate.toJSON());
        });
        // Code for collecting ICE candidates above

        this.props.peerConnection.addEventListener('track', event => {
            let remoteStream = this.state.remoteStream; // WARN: maybe clone this ?
            console.log('Got presenter track:', event.streams[0]);
            event.streams[0].getTracks().forEach(track => {
                console.log('Add a track to the remoteStream:', track);
                remoteStream.addTrack(track);
            });
            this.setState({remoteStream:remoteStream});
        });

        // Code for creating SDP answer below
        const offer = roomSnapshot.data().offer;
        console.log('Got offer:', offer);
        await this.props.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await this.props.peerConnection.createAnswer();
        console.log('Created answer:', answer);
        await this.props.peerConnection.setLocalDescription(answer);

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
                    await this.props.peerConnection.addIceCandidate(new RTCIceCandidate(data));
                }
            });
        });
        // Listening for remote ICE candidates above

    }

    async hangUp() {
        if (this.remoteStream) {
            this.remoteStream.getTracks().forEach(track => track.stop());
        }

        if (this.props.peerConnection) {
            this.props.peerConnection.close();
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
