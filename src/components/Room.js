import React, { useRef, useEffect } from "react";
import io from "socket.io-client";
import DragBox from "./DragBox";
import Button from "@material-ui/core/Button";

const Room = (props) => {
    const userVideo = useRef();
    const partnerVideo = useRef();
    const peerRef = useRef();
    const socketRef = useRef();
    const otherUser = useRef();
    const userStream = useRef();
    const senders = useRef([]);

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(stream => {
            userVideo.current.srcObject = stream;
            userStream.current = stream;

            socketRef.current = io.connect("https://localhost:8000/");
            socketRef.current.emit("join room", props.roomId);

            socketRef.current.on('other user', userID => {
                console.log("OTHER USER! " + userID)
                callUser(userID);
                otherUser.current = userID;
            });

            socketRef.current.on("user joined", userID => {
                otherUser.current = userID;
            });

            socketRef.current.on("offer", handleReceiveCall);

            socketRef.current.on("answer", handleAnswer);

            socketRef.current.on("ice-candidate", handleNewICECandidateMsg);

            socketRef.current.on('disconnect', () => {
                console.log("DISCONNECTED!")
            });
            socketRef.current.on('connect_error', (error) => {
                console.log("error: ", error);
            });

        });

    }, []);

    function callUser(userID) {
        peerRef.current = createPeer(userID);
        userStream.current.getTracks().forEach(track => {
            console.log(track);
            senders.current.push(peerRef.current.addTrack(track, userStream.current))
        });
    }

    function createPeer(userID) {
        const peer = new RTCPeerConnection({
            iceServers: [
                {
                    urls: "stun:stun.stunprotocol.org"
                },
                {
                    urls: 'turn:numb.viagenie.ca',
                    credential: 'muazkh',
                    username: 'webrtc@live.com'
                },
            ]
        });

        registerPeerConnectionListeners();

        peer.onicecandidate = handleICECandidateEvent;
        peer.ontrack = handleTrackEvent;
        peer.onnegotiationneeded = () => handleNegotiationNeededEvent(userID);

        return peer;
    }

    function handleNegotiationNeededEvent(userID) {
        peerRef.current.createOffer().then(offer => {
            return peerRef.current.setLocalDescription(offer);
        }).then(() => {
            const payload = {
                target: userID,
                caller: socketRef.current.id,
                sdp: peerRef.current.localDescription
            };
            socketRef.current.emit("offer", payload);
        }).catch(e => console.log(e));
    }

    function handleReceiveCall(incoming) {
        peerRef.current = createPeer();
        const desc = new RTCSessionDescription(incoming.sdp);
        peerRef.current.setRemoteDescription(desc).then(() => {
            userStream.current.getTracks().forEach(track => peerRef.current.addTrack(track, userStream.current));
            // userStream.current.getTracks().forEach(track => senders.current.push(peerRef.current.addTrack(track, userStream.current)));
        }).then(() => {
            return peerRef.current.createAnswer();
        }).then(answer => {
            return peerRef.current.setLocalDescription(answer);
        }).then(() => {
            const payload = {
                target: incoming.caller,
                caller: socketRef.current.id,
                sdp: peerRef.current.localDescription
            }
            socketRef.current.emit("answer", payload);
        })
    }

    function handleAnswer(message) {
        const desc = new RTCSessionDescription(message.sdp);
        peerRef.current.setRemoteDescription(desc).catch(e => console.log(e));
    }

    function handleICECandidateEvent(e) {
        if (e.candidate) {
            const payload = {
                target: otherUser.current,
                candidate: e.candidate
            }
            socketRef.current.emit("ice-candidate", payload);
        }
    }

    function handleNewICECandidateMsg(incoming) {
        const candidate = new RTCIceCandidate(incoming);

        peerRef.current.addIceCandidate(candidate)
            .catch(e => console.log(e));
    }

    function handleTrackEvent(e) {
        partnerVideo.current.srcObject = e.streams[0];
    };

    function shareScreen() {
        navigator.mediaDevices.getDisplayMedia({ cursor: true }).then(stream => {
            const screenTrack = stream.getTracks()[0];
            let sender = senders.current.find(sender => {
                console.log(sender);
                if (sender.track.kind === 'video') {
                    return sender;
                }
            });
            console.log(sender);
            sender.replaceTrack(screenTrack);
            screenTrack.onended = function() {
                senders.current.find(sender => sender.track.kind === "video").replaceTrack(userStream.current.getTracks()[1]);
            }
        })
    }

    function registerPeerConnectionListeners() {
        peerRef.addEventListener('icegatheringstatechange', () => {
            console.log(
                `ICE gathering state changed: ${peerRef.iceGatheringState}`);
        });

        peerRef.addEventListener('connectionstatechange', () => {
            console.log(`Connection state change: ${peerRef.connectionState}`);
        });

        peerRef.addEventListener('signalingstatechange', () => {
            console.log(`Signaling state change: ${peerRef.signalingState}`);
        });

        peerRef.addEventListener('iceconnectionstatechange ', () => {
            console.log(
                `ICE connection state change: ${peerRef.iceConnectionState}`);
        });
    }

    return (
        <DragBox>
            <div style={{width:'100%'}}>
                <small>RoomID: {props.roomId}</small>
                <Button onClick={shareScreen}>Share screen</Button>
            </div>
            <video controls style={{height:250, width:'100%'}} autoPlay ref={userVideo} muted={true} />
            <video controls style={{height:250, width:'100%'}} autoPlay ref={partnerVideo} />
        </DragBox>
    );
};

export default Room;
