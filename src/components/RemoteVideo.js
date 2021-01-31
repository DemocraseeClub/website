import React from "react";
import Typography from "@material-ui/core/Typography";

class RemoteVideo extends React.Component {

    constructor(p) {
        super(p);
        this.partnerVideo = React.createRef();
        this.remoteStream = new MediaStream();
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
        console.log('Got room:', roomSnapshot.exists);
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
            console.log('Got presenter track:', event.streams[0]);
            event.streams[0].getTracks().forEach(track => {
                console.log('Add a track to the remoteStream:', track);
                this.remoteStream.addTrack(track);
            });
            this.partnerVideo.current.srcObject = this.remoteStream;
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

        this.partnerVideo.current.srcObject = this.remoteStream;

    }

    async hangUp() {
        if (this.remoteStream) {
            this.remoteStream.getTracks().forEach(track => track.stop());
        }

        if (this.props.peerConnection) {
            this.props.peerConnection.close();
        }

        this.partnerVideo.current.srcObject = null;

        // Delete room on hangup
        if (this.props.roomId) {
            const roomRef = this.props.db.collection('rooms').doc(this.props.roomId);
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

    render() {
        // TODO: add hangup button
        return (
            <div>
                <Typography variant='caption' component={'span'} >{this.props.roomId}</Typography>
                <video controls style={{height: 250, width: '100%'}} autoPlay ref={this.partnerVideo}/>
            </div>
        );
    }

}

export default RemoteVideo;
