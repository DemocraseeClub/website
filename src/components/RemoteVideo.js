import React from "react";
import VideoElement from "./VideoElement";
import PropTypes from "prop-types";
import Config from "../Config";
import { Beforeunload } from "react-beforeunload";

class RemoteVideo extends React.Component {
  constructor(p) {
    super(p);
    this.state = { remoteStream: p.stream, view: false, added: false, viewers: null};
  }

  componentDidMount() {
    this.joinRoomById(this.props.roomId);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (!this.props.roomId && prevProps.roomId) {
      this.hangUp();
    }

    if(!this.state.added && !prevProps.myRoomId && this.props.myRoomId) {
      console.log('actualizando')
      this.handleViewers('add')
    }

  }

  async componentWillUnmount() {
    await this.hangUp();
    if (this.state.view) {
      await this.handleViewers("remove");
      this.setState({ view: false });
    }
  }

  async handleViewers(action) {
    const roomRef = window.fireDB.collection("rooms").doc(this.props.roomId);
    const roomSnapshot = await roomRef.get();

    if(!roomSnapshot.data()) return -1;

    const viewers = roomSnapshot.data().viewers;
    const roomsViewing = roomSnapshot.data().roomsViewing;


    switch (action) {
      case "add":
        let auxRoomsAdd = new Set([...roomsViewing]);
        if (this.props.myRoomId) {
          auxRoomsAdd.add(this.props.myRoomId);
          this.setState({added:true})
        }
        console.log(auxRoomsAdd, Array.from(auxRoomsAdd).length, "rommsadd")
        roomRef.update({
          viewers: this.props.myRoomId ? Array.from(auxRoomsAdd).length : viewers + 1,
          roomsViewing: Array.from(auxRoomsAdd),
        });
        this.setState({viewers: this.props.myRoomId ? Array.from(auxRoomsAdd).length : viewers + 1})

        break;
      case "remove":
        let auxRoomsRemove = [...roomsViewing];

        if (this.props.myRoomId) {
          let i = auxRoomsRemove.indexOf(this.props.myRoomId);
          auxRoomsRemove.splice(i, 1);
        }
        console.log(auxRoomsRemove, Array.from(auxRoomsRemove).length, "romms remove")
        roomRef.update({
          viewers: this.props.myRoomId ?  auxRoomsRemove.length : viewers - 1,
          roomsViewing: auxRoomsRemove,
        });
        this.setState({viewers: this.props.myRoomId ?  auxRoomsRemove.length : viewers - 1})
        break;
      default:
        console.log("invalid action");
        break;
    }
  }

  async joinRoomById(room) {
    const roomRef = window.fireDB.collection("rooms").doc(room);

    const roomSnapshot = await roomRef.get();

    if (roomSnapshot.data()) {
      console.log("Got room:", roomSnapshot.exists, roomRef);
      if (!roomSnapshot.exists) return false;

      this.peerConnection = this.createPeerConnection();

      this.peerConnection.onaddstream = (event) => {
        console.log("ON ADDED STREAM", event);
        this.setState({ remoteStream: event.stream });
      };

      //Updating viewers in Firestore
      await this.handleViewers("add");
      this.view = true;
      this.setState({ view: true });
      /** */

      // Code for collecting ICE candidates below
      const calleeCandidatesCollection = roomRef.collection("calleeCandidates");
      this.peerConnection.addEventListener("icecandidate", (event) => {
        if (!event.candidate) {
          console.log("Got final icecandidate!", event);
          return;
        }
        console.log("Got candidate: ", event.candidate);
        calleeCandidatesCollection.add(event.candidate.toJSON());
      });
      // Code for collecting ICE candidates above

      this.peerConnection.addEventListener("track", (event) => {
        let remoteStream = this.state.remoteStream; // WARN: maybe clone this ?
        console.log("Got presenter track:", event.streams[0]);
        event.streams[0].getTracks().forEach((track) => {
          console.log("Add a track to the remoteStream:", track);
          remoteStream.addTrack(track);
        });
        this.setState({ remoteStream: remoteStream });
      });

      this.peerConnection.ontrack = (event) => {
        let remoteStream = this.state.remoteStream; // WARN: maybe clone this ?
        console.log("Got presenter track:", event.streams[0]);
        event.streams[0].getTracks().forEach((track) => {
          console.log("Add a track to the remoteStream:", track);
          remoteStream.addTrack(track);
        });
        this.setState({ remoteStream: remoteStream });
      };

      // Code for creating SDP answer below
      const offer = roomSnapshot.data().offer;
      console.log("Got offer:", offer);
      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answer = await this.peerConnection.createAnswer();
      console.log("Created answer:", answer);
      await this.peerConnection.setLocalDescription(answer);

      const roomWithAnswer = {
        answer: { type: answer.type, sdp: answer.sdp },
      };
      await roomRef.update(roomWithAnswer);
      // Code for creating SDP answer above

      // Listening for remote ICE candidates below
      roomRef.collection("callerCandidates").onSnapshot((snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === "added") {
            let data = change.doc.data();
            console.log(
              `Got new remote callerCandidates: ${JSON.stringify(data)}`
            );
            await this.peerConnection.addIceCandidate(
              new RTCIceCandidate(data)
            );
          }
        });
      });
      // Listening for remote ICE candidates above
    } else {
      this.hangUp();
      console.log("BAD ROOM", roomSnapshot);
    }
  }

  createPeerConnection() {
    console.log(
      "Create PeerConnection with configuration: ",
      Config.peerConfig
    );
    let peerConnection = new RTCPeerConnection(Config.peerConfig);
    peerConnection.addEventListener("icegatheringstatechange", () => {
      console.log(
        `ICE gathering state changed: ${peerConnection.iceGatheringState}`
      );
    });

    peerConnection.addEventListener("connectionstatechange", async () => {
      console.log(`Connection state change: ${peerConnection.connectionState}`);

      switch (peerConnection.connectionState) {
        case "disconnected":
          await this.handleViewers("remove");
          this.setState({ view: false });

          break;
        default:
          break;
      }
    });

    peerConnection.addEventListener("signalingstatechange", () => {
      console.log(`Signaling state change: ${peerConnection.signalingState}`);
    });

    peerConnection.addEventListener("iceconnectionstatechange ", () => {
      console.log(
        `ICE connection state change: ${peerConnection.iceConnectionState}`
      );
    });

    if (this.state.remoteStream) {
      console.log("adding remote stream");
      this.state.remoteStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, this.state.remoteStream);
      });
    }

    return peerConnection;
  }

  async hangUp() {
    console.log("HANGING UP REMOTE!");
    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach((track) => track.stop());
    }

    if (this.peerConnection) {
      this.peerConnection.close();
    }

    this.setState({ remoteStream: null }, () => {
      this.props.handleHangUp(this.props.roomId);
    });
  }

  async handleBeforeUnload(e) {
    if (this.state.view) {
      e.preventDefault();
      await this.handleViewers("remove");
      this.setState({ view: false });
    }
  }

  render() {
    return (
      <Beforeunload onBeforeunload={(e) => this.handleBeforeUnload(e)}>
        <VideoElement
          stream={this.state.remoteStream}
          roomId={this.props.roomId}
          notShowCode={true}
          viewers={this.state.viewers}
        />
      </Beforeunload>
    );
  }
}

RemoteVideo.propTypes = {
  roomId: PropTypes.string.isRequired,
};

export default RemoteVideo;
