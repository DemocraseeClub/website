import React from "react";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Grid from "@material-ui/core/Grid";
import TextField from '@material-ui/core/TextField';
import Badge from '@material-ui/core/Badge';
import RemoteVideo from "./RemoteVideo";
import {withSnackbar} from 'notistack';
import VideoElement from "./VideoElement";
import VideoCamIcon from '@material-ui/icons/Videocam';
import MicIcon from '@material-ui/icons/Mic';
import ScreenShareIcon from '@material-ui/icons/ScreenShare';
import {getParam} from '../Util/WindowUtils';
import VisibilityIcon from "@material-ui/icons/Visibility";
import ShareIcon from "@material-ui/icons/Share";
import PasswordIcon from "@material-ui/icons/VpnKey";
import Box from "@material-ui/core/Box";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Collapse from "@material-ui/core/Collapse";
import ViewerManagement from "./ViewerManagement";
import RoomStore from "../redux/RoomStore";
import CircularProgress from "@material-ui/core/CircularProgress";

class Room extends React.Component {
    constructor(props) {
        super(props);

        // Initialize state from the store
        this.store = RoomStore.getInstance();
        this.state = {
            ...this.store.getState(),
            roomFieldText: '',
            videoLoading: false,
            audioLoading: false,
            screenLoading: false
        };
    }

    componentDidMount() {
        // Subscribe to store changes with event support
        this.unsubscribe = this.store.subscribe((state, event) => {
            // Update state
            this.setState(state);

            // Handle specific events
            if (event) {
                switch (event.type) {
                    case 'mediaError':
                        this.props.enqueueSnackbar(
                            `Media error: ${event.error || 'Could not access media'}`,
                            {variant: 'error'}
                        );
                        this.setState({
                            videoLoading: false,
                            audioLoading: false,
                            screenLoading: false
                        });
                        break;

                    case 'broadcasterReconnected':
                        this.props.enqueueSnackbar(
                            'Broadcaster reconnected',
                            {variant: 'info'}
                        );
                        break;
                }
            }
        });

        // Check URL for roomId
        let roomId = getParam('roomId', document.location.search);
        if (roomId.length === 20) {
            this.setState({roomFieldText: roomId});
            document.getElementById('roomIdField').scrollIntoView({block: 'start', behavior: 'smooth'});
            this.props.enqueueSnackbar(
                `Enable your Cam/Mic/Screen & click connect when you are ready to join`,
                {variant: 'success', persist: true}
            );
        }

        // Check for previous broadcast
        this.store.checkForPreviousBroadcast(roomId => {
            this.props.enqueueSnackbar(
                `You have a recent broadcast room. Would you like to reconnect?`,
                {
                    variant: 'info',
                    persist: true,
                    action: (
                        <Button
                            color="inherit"
                            variant="outlined"
                            size="small"
                            onClick={() => this.handleReconnect(roomId)}
                        >
                            Reconnect
                        </Button>
                    )
                }
            );
        });

        // Add event listener for browser navigation
        window.addEventListener('popstate', this.handlePopState);
    }

    componentWillUnmount() {
        // Unsubscribe from store
        if (this.unsubscribe) {
            this.unsubscribe();
        }

        // Clean up store resources
        this.store.cleanup();

        // Remove event listener
        window.removeEventListener('popstate', this.handlePopState);
    }

    // Handle browser navigation
    handlePopState = (event) => {
        const roomId = getParam('roomId', document.location.search);

        // If we're broadcasting and navigating away from our room
        if (this.state.myRoom && roomId !== this.state.myRoom) {
            this.store.hangUp(true); // Keep room, just clean up local resources
        }

        // If we're viewing rooms and the URL changes
        if (this.state.roomsViewing.length > 0) {
            if (roomId.length === 20) {
                // Check if we're already viewing this room
                const existingRoom = this.state.roomsViewing.find(r => r.roomId === roomId);
                if (!existingRoom) {
                    // Set the room ID in the field and let the user connect manually
                    this.setState({roomFieldText: roomId});
                }
            }
        }
    };

    // Handle reconnecting to a previous broadcast
    handleReconnect = async (roomId) => {
        const success = await this.store.reconnectToRoom(roomId);

        if (success) {
            this.props.enqueueSnackbar(
                `Reconnected to your previous broadcast`,
                {variant: 'success'}
            );
        } else {
            this.props.enqueueSnackbar(
                `Failed to reconnect to your previous broadcast`,
                {variant: 'error'}
            );
        }
    };

    // Handle toggling camera/microphone
    handleToggleCamMic = async (type) => {
        // Disable button immediately
        const tempState = {};
        tempState[`${type}Loading`] = true;
        this.setState(tempState);

        try {
            const success = await this.store.toggleCamMic(type);

            if (!success) {
                this.props.enqueueSnackbar(
                    `Failed to toggle ${type}`,
                    {variant: 'error'}
                );
            }
        } catch (error) {
            console.error(`Error toggling ${type}:`, error);
            this.props.enqueueSnackbar(
                `Error: ${error.message || `Could not toggle ${type}`}`,
                {variant: 'error'}
            );
        }

        // Ensure loading state is cleared
        tempState[`${type}Loading`] = false;
        this.setState(tempState);
    };

    // Handle toggling screen sharing
    handleToggleScreenShare = async () => {
        // Disable button immediately
        this.setState({screenLoading: true});

        try {
            const success = await this.store.toggleScreenShare();

            if (!success) {
                this.props.enqueueSnackbar(
                    `Failed to toggle screen sharing`,
                    {variant: 'error'}
                );
            } else {
                const stream = this.state.myStream;
                console.log('[WRTC] Screen share stream tracks:', stream.getTracks().map(t => ({
                    kind: t.kind,
                    enabled: t.enabled,
                    muted: t.muted
                })));
            }
        } catch (error) {
            console.error('Error toggling screen share:', error);
            this.props.enqueueSnackbar(
                `Error: ${error.message || 'Could not share screen'}`,
                {variant: 'error'}
            );
        }

        // Ensure loading state is cleared
        this.setState({screenLoading: false});
    };

    // Handle creating a new room
    handleCreateRoom = async () => {
        const success = await this.store.createRoom();

        if (success) {
            this.props.enqueueSnackbar(
                `Share your room ID - ${this.state.myRoom} - with anyone you want to view your broadcast`,
                {variant: 'success'}
            );
        } else {
            console.log(success)
            this.props.enqueueSnackbar(
                `Failed to create broadcast room`,
                {variant: 'error'}
            );
        }
    };

    // Handle joining a room
    handleJoinRoom = async () => {
        const roomId = this.state.roomFieldText;

        if (roomId.length !== 20) {
            this.props.enqueueSnackbar(
                `Invalid room ID`,
                {variant: 'error'}
            );


            return;
        }

        // Check if already viewing this room
        const existingRoom = this.state.roomsViewing.find(r => r.roomId === roomId);
        if (existingRoom) {
            this.props.enqueueSnackbar(
                `Already connected to this room`,
                {variant: 'warning'}
            );
            return;
        }

        const result = await this.store.joinRoom(roomId);

        if (result.status === 'approved') {
            this.props.enqueueSnackbar(
                `Connected to room ${roomId}`,
                {variant: 'success'}
            );
            this.setState({roomFieldText: ''});
        } else if (result.status === 'pending') {
            this.props.enqueueSnackbar(
                `Waiting for broadcaster approval`,
                {variant: 'info', persist: true}
            );
            this.setState({roomFieldText: ''});
        } else {
            this.props.enqueueSnackbar(
                `Failed to join room: ${result.error?.message || 'Unknown error'}`,
                {variant: 'error'}
            );
        }
    };

    // Handle hanging up
    handleHangUp = async () => {
        await this.store.hangUp(true); // Keep room for reconnect
        this.props.enqueueSnackbar(
            `Broadcast disconnected`,
            {variant: 'info'}
        );
    };

    // Handle terminating a room
    handleTerminateRoom = async () => {
        await this.store.hangUp(false); // Terminate room completely
        this.props.enqueueSnackbar(
            `Broadcast terminated`,
            {variant: 'info'}
        );
    };

    // Handle leaving a specific room
    handleLeaveRoom = async (roomId) => {
        await this.store.handleHangUp(roomId);
        this.props.enqueueSnackbar(
            `Disconnected from room`,
            {variant: 'info'}
        );
    };

    // Handle toggling approve requirement
    handleToggleRequireApproval = async () => {
        const success = await this.store.toggleRequireApproval();

        if (success) {
            this.props.enqueueSnackbar(
                `Viewer approval ${this.state.requireApproval ? 'enabled' : 'disabled'}`,
                {variant: 'info'}
            );
        } else {
            this.props.enqueueSnackbar(
                `Failed to update approval setting`,
                {variant: 'error'}
            );
        }
    };

    // Handle toggling room ID visibility
    handleToggleShowRoomId = () => {
        this.store.toggleShowRoomId();

        if (!this.state.showRoomId) {
            this.handleCopyRoomUrl();
        }
    };

    // Handle copying room URL
    handleCopyRoomUrl = () => {
        const success = this.store.copyRoomUrl();

        if (success) {
            this.props.enqueueSnackbar(
                `Your room URL has been copied to your clipboard`,
                {variant: 'success'}
            );
        } else {
            this.props.enqueueSnackbar(
                `Failed to copy room URL`,
                {variant: 'error'}
            );
        }
    };

    // Handle toggling viewer management
    handleToggleViewerManagement = () => {
        this.store.toggleViewerManagement();
    };

    render() {
        const {
            myRoom, showRoomId, enabled, startingRoom, roomsViewing,
            myStream, viewers, numberOfViewers, showViewerManagement,
            requireApproval, videoLoading, audioLoading, screenLoading,
            approvedViewers, pendingViewers, blockedViewers
        } = this.state;

        const isEnabled = enabled.video || enabled.audio || enabled.screen;
        const hasVideos = (myStream || viewers.length > 0 || roomsViewing.length > 0);

        return (
            <Box p={1}>
                <Grid container justify={'space-between'} alignItems="center" spacing={2} alignContent={'center'}>
                    {myRoom ? (
                        <React.Fragment>
                            <Grid item>
                                <Button variant="contained" color="primary" onClick={this.handleHangUp}>Hangup</Button>
                            </Grid>
                            <Grid item>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={this.handleTerminateRoom}
                                >
                                    Terminate
                                </Button>
                            </Grid>
                            <Grid item>
                                <Badge showZero={true} color="error"
                                       onClick={this.handleToggleViewerManagement}

                                       badgeContent={numberOfViewers}>
                                    <VisibilityIcon/>
                                </Badge>
                            </Grid>
                            <Grid item>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={this.handleToggleShowRoomId}
                                    endIcon={<PasswordIcon color={showRoomId ? 'error' : 'default'}/>}
                                >
                                    {showRoomId ? myRoom : ' **** '}
                                </Button>
                            </Grid>
                            <Grid item>
                                <ShareIcon onClick={this.handleCopyRoomUrl}/>
                            </Grid>
                            <Grid item>
                                <FormControlLabel
                                    size={'small'}
                                    control={
                                        <Switch
                                            size={'small'}
                                            checked={requireApproval}
                                            onChange={this.handleToggleRequireApproval}
                                            color="primary"
                                        />
                                    }
                                    label="Require Approval to Join"
                                />
                            </Grid>
                        </React.Fragment>
                    ) : (
                        <Grid item>
                            <Button
                                variant="contained"
                                color="primary"
                                disabled={!isEnabled || startingRoom}
                                onClick={this.handleCreateRoom}
                            >
                                {startingRoom ? 'Starting...' : 'Broadcast'}
                            </Button>
                        </Grid>
                    )}

                    <Grid item style={{flexGrow: 1}}>
                        <ButtonGroup variant="contained" color="primary" aria-label="broadcast options"
                                     style={{marginLeft: 10}}>
                            <Button
                                endIcon={
                                    videoLoading ?
                                        <CircularProgress size={16} color="inherit"/> :
                                        <VideoCamIcon color={enabled.video ? 'error' : 'inherit'}/>
                                }
                                onClick={() => this.handleToggleCamMic('video')}
                                disabled={videoLoading || startingRoom}
                            >
                                {videoLoading ? 'Loading...' : 'Cam'}
                            </Button>
                            <Button
                                endIcon={
                                    audioLoading ?
                                        <CircularProgress size={16} color="inherit"/> :
                                        <MicIcon color={enabled.audio ? 'error' : 'inherit'}/>
                                }
                                onClick={() => this.handleToggleCamMic('audio')}
                                disabled={audioLoading || startingRoom}
                            >
                                {audioLoading ? 'Loading...' : 'Mic'}
                            </Button>
                            <Button
                                endIcon={
                                    screenLoading ?
                                        <CircularProgress size={16} color="inherit"/> :
                                        <ScreenShareIcon color={enabled.screen ? 'error' : 'inherit'}/>
                                }
                                onClick={this.handleToggleScreenShare}
                                disabled={screenLoading || startingRoom}
                            >
                                {screenLoading ? 'Loading...' : 'Screen'}
                            </Button>
                        </ButtonGroup>
                    </Grid>

                    <Grid item>
                        <TextField
                            size={'small'}
                            margin={'dense'}
                            label="Enter Room ID"
                            variant={'filled'}
                            color="secondary"
                            inputProps={{maxLength: 20}}
                            id={'roomIdField'}
                            value={this.state.roomFieldText}
                            onChange={e => this.setState({roomFieldText: e.target.value})}
                            InputProps={{
                                endAdornment: (
                                    <Button
                                        onClick={this.handleJoinRoom}
                                        variant={'contained'}
                                        color={'primary'}
                                        size={'small'}
                                        disabled={this.state.roomFieldText.length !== 20}
                                    >
                                        Connect
                                    </Button>
                                )
                            }}
                        />
                    </Grid>
                </Grid>

                {/* Viewer Management Panel */}
                <Collapse p={0} in={showViewerManagement}>
                    <ViewerManagement
                        roomId={myRoom}
                        onManageViewer={(viewerId, action) => this.store.manageViewer(viewerId, action)}
                        onRefresh={() => this.store.refreshViewerLists()}
                        approvedViewers={approvedViewers || []}
                        pendingViewers={pendingViewers || []}
                        blockedViewers={blockedViewers || []}
                        activeViewers={viewers || []}
                    />
                </Collapse>

                {/* Video Streams */}
                {hasVideos && (
                    <div className={this.props.classes.hScrollContainer}>
                        <div className={this.props.classes.hScroller}>
                            {myStream && (
                                <div className={this.props.classes.hScrollItem}>
                                    <VideoElement
                                        roomId={myRoom}
                                        stream={myStream}
                                        muted={true}
                                        viewers={numberOfViewers}
                                    />
                                </div>
                            )}

                            {roomsViewing.map((room, index) => (
                                <div className={this.props.classes.hScrollItem} key={room.roomId + index}>
                                    <RemoteVideo
                                        roomId={room.roomId}
                                        myRoomId={myRoom}
                                        stream={room.stream}
                                        handleHangUp={(id) => this.handleLeaveRoom(id)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Box>
        );
    }
}

export default withSnackbar(Room);
