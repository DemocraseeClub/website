import React from "react";
import VideoElement from "./VideoElement";
import PropTypes from "prop-types";
import Typography from "@material-ui/core/Typography";
import {Beforeunload} from "react-beforeunload";
import {withSnackbar} from 'notistack';
import WebRTCService from "../redux/WebRTCService";
import CircularProgress from "@material-ui/core/CircularProgress";

class RemoteVideo extends React.Component {
    constructor(props) {
        super(props);
        this.rtcService = WebRTCService.getInstance();
        this.state = {
            remoteStream: props.stream,
            accessStatus: "checking", // "checking", "approved", "pending", "blocked", "denied"
            viewers: null,
            loading: true
        };
    }

    componentDidMount() {
        console.log("[WRTC] RemoteVideo mounting for room:", this.props.roomId);
        console.log('[WRTC] Remote stream tracks:', this.props.stream?.getTracks().map(t => ({
            kind: t.kind,
            enabled: t.enabled,
            muted: t.muted
        })));
        if (!this.props.stream) {
            console.warn('No remote stream received in RemoteVideo');
        }

        // Subscribe to WebRTC service events with enhanced error handling
        this.unsubscribe = this.rtcService.subscribe((eventType, data) => {
            try {
                console.log("[WRTC] WebRTC event received:", eventType, data);
                this.handleRtcEvent(eventType, data);
            } catch (error) {
                console.error("Error handling WebRTC event:", error);
            }
        });

        // Connect to the room with better error reporting
        this.connectToRoom().catch(error => {
            console.error("Error in initial room connection:", error);
            this.setState({
                accessStatus: 'denied',
                loading: false
            });
            this.props.enqueueSnackbar(
                `Failed to connect: ${error.message || 'Unknown error'}`,
                {variant: "error"}
            );
        });
    }

    componentDidUpdate(prevProps) {
        // If the room ID changed, reconnect
        if (this.props.roomId !== prevProps.roomId) {
            console.log("[WRTC] Room ID changed, reconnecting to:", this.props.roomId);
            this.setState({loading: true, accessStatus: "checking"});
            this.connectToRoom().catch(error => {
                console.error("Error reconnecting to room:", error);
                this.setState({
                    accessStatus: 'denied',
                    loading: false
                });
            });
        }

        // If the stream prop changes
        if (prevProps.stream !== this.props.stream) {
            console.log("[WRTC] Stream prop changed in RemoteVideo");
            if (this.props.stream && this.props.stream.getTracks().length > 0) {
                this.setState({remoteStream: this.props.stream});
            }
        }
    }

    componentWillUnmount() {
        console.log("[WRTC] RemoteVideo unmounting for room:", this.props.roomId);

        // Clean up event listener
        if (this.unsubscribe) {
            this.unsubscribe();
        }

        // Leave the room
        this.rtcService.leaveRoom(this.props.myRoomId);
    }

    // Handle WebRTC service events
    handleRtcEvent = (eventType, data) => {
        switch (eventType) {
            case 'remoteStreamReceived':
                console.log("[WRTC] Remote stream received:", data);

                // Log detailed track information
                if (data.stream) {
                    console.log(`[WRTC] Stream ID: ${data.stream.id}`);
                    console.log(`[WRTC] Video tracks: ${data.stream.getVideoTracks().length}`);
                    console.log(`[WRTC] Audio tracks: ${data.stream.getAudioTracks().length}`);

                    data.stream.getTracks().forEach((track, index) => {
                        console.log(`[WRTC] Track ${index}: ${track.kind}, enabled: ${track.enabled}, muted: ${track.muted}`);
                    });
                }

                // Only update if it's for our room
                if (this.props.roomId === data.roomId) {
                    // Verify the stream has tracks
                    if (data.stream) { //  && (data.stream.getVideoTracks().length > 0 || data.stream.getAudioTracks().length > 0)
                        this.setState({
                            remoteStream: data.stream,
                            loading: false,
                            trackInfo: {
                                videoTracks: data.stream.getVideoTracks().length,
                                audioTracks: data.stream.getAudioTracks().length
                            }
                        });
                        // Since the VideoElement component will handle attaching the stream,
                        // we don't need to duplicate that here
                    } else {
                        console.warn("Received stream has no tracks");
                    }
                }
                break;

            case 'roomJoined':
                if (data.roomId === this.props.roomId && data.status === 'approved') {
                    this.setState({
                        accessStatus: 'approved',
                        loading: false
                    });
                }
                break;

            case 'accessBlocked':
                if (data.roomId === this.props.roomId) {
                    this.setState({
                        accessStatus: 'blocked',
                        loading: false
                    });
                    this.props.enqueueSnackbar("You have been blocked from this room", {variant: "error"});
                }
                break;

            case 'accessRevoked':
                if (data.roomId === this.props.roomId) {
                    this.setState({
                        accessStatus: 'pending',
                        loading: false
                    });
                    this.props.enqueueSnackbar("Waiting for broadcaster approval", {variant: "info"});
                }
                break;

            case 'roomClosed':
                if (data.roomId === this.props.roomId) {
                    this.setState({
                        accessStatus: 'denied',
                        loading: false
                    });
                    this.props.enqueueSnackbar("This room has been closed", {variant: "info"});
                    if (this.props.handleHangUp) {
                        this.props.handleHangUp(this.props.roomId);
                    }
                }
                break;

            case 'broadcasterReconnected':
                this.props.enqueueSnackbar("Broadcaster reconnected - reestablishing connection", {variant: "info"});
                break;

            case 'viewerCountChanged':
                this.setState({viewers: data.count});
                break;

            case 'hungUp':
                this.setState({loading: false});
                break;
        }
    };

    // Connect to the room
    connectToRoom = async () => {
        try {
            console.log("[WRTC] Connecting to room:", this.props.roomId);
            const result = await this.rtcService.joinRoom(this.props.roomId, this.props.myRoomId);
            console.log("[WRTC] Join room result:", result);

            if (result.status === 'approved') {
                this.setState({
                    accessStatus: 'approved',
                    loading: false
                });
            } else if (result.status === 'pending') {
                this.setState({
                    accessStatus: 'pending',
                    loading: false
                });
                this.props.enqueueSnackbar("Waiting for broadcaster approval", {variant: "info"});
            } else {
                this.setState({
                    accessStatus: 'denied',
                    loading: false
                });
                this.props.enqueueSnackbar("Could not join room", {variant: "error"});
            }
        } catch (error) {
            console.error("Error joining room:", error);
            this.setState({
                accessStatus: 'denied',
                loading: false
            });
            this.props.enqueueSnackbar("Error joining room: " + error.message, {variant: "error"});

            if (this.props.handleHangUp) {
                this.props.handleHangUp(this.props.roomId);
            }
        }
    };

    // Handle beforeunload event
    handleBeforeUnload = (e) => {
        e.preventDefault();
        this.rtcService.leaveRoom(this.props.myRoomId);
    };

    render() {
        const {accessStatus, remoteStream, viewers, loading} = this.state;

        // Show loading state
        if (loading) {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 20,
                    height: 250,
                    width: '100%',
                    backgroundColor: '#f5f5f5',
                    borderRadius: 4
                }}>
                    <CircularProgress size={40}/>
                    <Typography variant="body1" style={{marginTop: 16}}>
                        Connecting to room...
                    </Typography>
                </div>
            );
        }

        // Show pending approval state
        if (accessStatus === "pending") {
            return (
                <div style={{
                    textAlign: "center",
                    padding: 20,
                    height: 250,
                    width: '100%',
                    backgroundColor: '#e3f2fd',
                    borderRadius: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Typography variant="h6">Waiting for approval...</Typography>
                    <Typography variant="body2">
                        The broadcaster needs to approve your request to view this stream.
                    </Typography>
                </div>
            );
        }

        // Show blocked or denied state
        if (accessStatus === "blocked" || accessStatus === "denied") {
            return (
                <div style={{
                    textAlign: "center",
                    padding: 20,
                    height: 250,
                    width: '100%',
                    backgroundColor: '#ffebee',
                    borderRadius: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Typography variant="h6">Access Denied</Typography>
                    <Typography variant="body2">
                        {accessStatus === "blocked"
                            ? "You have been blocked from viewing this stream."
                            : "This room is not available or you do not have permission to join."}
                    </Typography>
                </div>
            );
        }

        // Verify we have a valid stream with tracks
        if (!remoteStream || remoteStream.getTracks().length === 0) {
            return (
                <div style={{
                    textAlign: "center",
                    padding: 20,
                    height: 250,
                    width: '100%',
                    backgroundColor: '#fff9c4',
                    borderRadius: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Typography variant="h6">Waiting for media...</Typography>
                    <Typography variant="body2">
                        Connected to room, but no video stream is available yet.
                    </Typography>
                </div>
            );
        }

        // Show the video stream for approved users
        return (
            <Beforeunload onBeforeunload={this.handleBeforeUnload}>
                <VideoElement
                    stream={remoteStream}
                    roomId={this.props.roomId}
                    notShowCode={true}
                    viewers={viewers}
                />
            </Beforeunload>
        );
    }
}

RemoteVideo.propTypes = {
    roomId: PropTypes.string.isRequired,
    myRoomId: PropTypes.string,
    stream: PropTypes.object,
    handleHangUp: PropTypes.func,
    enqueueSnackbar: PropTypes.func.isRequired
};

RemoteVideo.defaultProps = {
    stream: new MediaStream()
};

export default withSnackbar(RemoteVideo);
