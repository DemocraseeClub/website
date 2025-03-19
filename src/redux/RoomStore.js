import WebRTCService from './WebRTCService';

/**
 * Store to manage room state
 */
class RoomStore {
    constructor() {
        this.rtcService = WebRTCService.getInstance();
        this.state = {
            myRoom: null,
            showRoomId: false,
            enabled: {video: false, audio: false, screen: false},
            startingRoom: false,
            roomsViewing: [],
            myStream: null,
            viewers: [],
            numberOfViewers: 0,
            pendingViewers: [],
            approvedViewers: [],
            blockedViewers: [],
            requireApproval: false,
            showViewerManagement: false,
        };
        this.listeners = [];

        // Generate a unique broadcaster ID if needed
        this.broadcasterId = localStorage.getItem('broadcaster_id');
        if (!this.broadcasterId) {
            this.broadcasterId = 'broadcaster_' + Math.random().toString(36).substring(2, 15) +
                Math.random().toString(36).substring(2, 15);
            localStorage.setItem('broadcaster_id', this.broadcasterId);
        }

        // Subscribe to WebRTC service events
        this.rtcUnsubscribe = this.rtcService.subscribe(this.handleRtcEvent);
    }

    // Singleton pattern
    static getInstance() {
        if (!RoomStore.instance) {
            RoomStore.instance = new RoomStore();
        }
        return RoomStore.instance;
    }

    /**
     * Handle events from the WebRTC service
     */
    handleRtcEvent = (eventType, data) => {
        switch (eventType) {
            case 'streamUpdated':
                this.setState({myStream: data.stream});
                break;

            case 'mediaToggled': {
                const enabled = {...this.state.enabled};
                enabled[data.type] = data.enabled;
                this.setState({
                    enabled,
                    startingRoom: false // Ensure startingRoom is set to false after media is toggled
                });
                break;
            }

            case 'mediaError':
                // Notify listeners about the error and reset loading state
                this.setState({startingRoom: false});
                // Pass the error event to components
                this.notifyListenersWithEvent('mediaError', data);
                break;

            case 'roomCreated':
            case 'roomReconnected':
                this.setState({
                    myRoom: data.roomId,
                    startingRoom: false
                });
                // Store room info for future reconnects
                localStorage.setItem('broadcasterRoom', data.roomId);
                localStorage.setItem('broadcasterTimestamp', Date.now().toString());

                // Update URL with the room ID
                const url = new URL(window.location);
                url.searchParams.set('roomId', data.roomId);
                window.history.pushState({}, '', url);
                break;

            case 'viewerCountChanged':
                this.setState({
                    numberOfViewers: data.count,
                    viewers: data.viewers
                });
                break;

            case 'hungUp':
                this.setState({
                    myRoom: null,
                    startingRoom: false,
                    myStream: null,
                    enabled: {video: false, audio: false, screen: false},
                    viewers: [],
                    numberOfViewers: 0
                });
                break;

            case 'roomTerminated':
                // Remove from localStorage
                localStorage.removeItem('broadcasterRoom');
                localStorage.removeItem('broadcasterTimestamp');

                // Remove the roomId from URL
                const urlAfterTerminate = new URL(window.location);
                urlAfterTerminate.searchParams.delete('roomId');
                window.history.pushState({}, '', urlAfterTerminate);
                break;

            case 'roomJoined':
                // Update the roomsViewing array
                if (data.status === 'approved') {
                    const roomsViewing = [...this.state.roomsViewing];
                    const existingRoomIndex = roomsViewing.findIndex(r => r.roomId === data.roomId);

                    if (existingRoomIndex === -1) {
                        roomsViewing.push({
                            roomId: data.roomId,
                            stream: new MediaStream()
                        });
                        this.setState({roomsViewing});
                    }

                    // Update URL
                    const urlAfterJoin = new URL(window.location);
                    urlAfterJoin.searchParams.set('roomId', data.roomId);
                    window.history.pushState({}, '', urlAfterJoin);
                }
                break;

            case 'remoteStreamReceived':
                // Find the room in roomsViewing and update its stream
                console.log("Remote stream received for room:", data.roomId);

                const roomsViewing = [...this.state.roomsViewing];
                const roomIndex = roomsViewing.findIndex(r => r.roomId === data.roomId);

                if (roomIndex !== -1) {
                    console.log("Updating stream for room:", data.roomId);
                    roomsViewing[roomIndex].stream = data.stream;
                    this.setState({roomsViewing});
                } else {
                    console.warn("Received stream for room that's not in roomsViewing:", data.roomId);
                }
                break;

            case 'broadcasterReconnected':
                // Update state to reflect broadcaster reconnection
                this.setState({startingRoom: false});
                break;

            case 'roomSettingsUpdated':
                // Update local state with new settings
                if (data.settings) {
                    // Only update settings that are in our state
                    const updatedState = {};
                    if (data.settings.requireApproval !== undefined) {
                        updatedState.requireApproval = data.settings.requireApproval;
                    }
                    this.setState(updatedState);
                }
                break;

            case 'viewerManaged':
                // Refresh viewer lists after management action
                this.refreshViewerLists();
                break;

            case 'roomClosed':
            case 'accessBlocked':
            case 'accessRevoked':
                // Remove from roomsViewing
                const updatedRooms = this.state.roomsViewing.filter(r => r.roomId !== data.roomId);
                this.setState({roomsViewing: updatedRooms});

                // Update URL if needed
                if (updatedRooms.length > 0) {
                    const url = new URL(window.location);
                    url.searchParams.set('roomId', updatedRooms[0].roomId);
                    window.history.pushState({}, '', url);
                } else {
                    const url = new URL(window.location);
                    url.searchParams.delete('roomId');
                    window.history.pushState({}, '', url);
                }
                break;
        }
    };

    /**
     * Clean up resources
     */
    cleanup() {
        if (this.rtcUnsubscribe) {
            this.rtcUnsubscribe();
        }
        this.rtcService.hangUp();
    }

    /**
     * Update component state and notify listeners
     * @param {Object} partialState - State to update
     */
    setState(partialState) {
        this.state = {...this.state, ...partialState};
        this.notifyListeners();
    }

    /**
     * Get current state
     */
    getState() {
        return {...this.state};
    }

    /**
     * Subscribe to state changes
     * @param {Function} listener - Function to call when state changes
     * @returns {Function} Unsubscribe function
     */
    subscribe(listener) {
        this.listeners.push(listener);
        // Initial call with current state
        try {
            listener(this.state);
        } catch (error) {
            console.error('Error in initial listener call:', error);
        }
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    /**
     * Notify all listeners of state change
     */
    notifyListeners() {
        this.listeners.forEach(listener => {
            try {
                listener(this.state);
            } catch (error) {
                console.error('Error in store listener:', error);
            }
        });
    }

    /**
     * Notify listeners with an event object
     */
    notifyListenersWithEvent(eventType, data) {
        this.listeners.forEach(listener => {
            try {
                // Call with state and an event object
                listener(this.state, {type: eventType, ...data});
            } catch (error) {
                console.error('Error in store listener with event:', error);
            }
        });
    }

    // Actions

    /**
     * Toggle camera or microphone
     * @param {string} type - 'video' or 'audio'
     */
    async toggleCamMic(type) {
        this.setState({startingRoom: true});

        try {
            const newValue = !this.state.enabled[type];
            await this.rtcService.toggleMedia(type, newValue);
            // Set startingRoom back to false after successful toggle
            this.setState({startingRoom: false});
            return true;
        } catch (error) {
            console.error(`Error toggling ${type}:`, error);
            this.setState({startingRoom: false});
            return false;
        }
    }

    /**
     * Toggle screen sharing
     */
    async toggleScreenShare() {
        this.setState({startingRoom: true});

        try {
            const newValue = !this.state.enabled.screen;
            await this.rtcService.toggleScreenShare(newValue);
            // Set startingRoom back to false after successful toggle
            this.setState({startingRoom: false});
            return true;
        } catch (error) {
            console.error('Error toggling screen share:', error);
            this.setState({startingRoom: false});
            return false;
        }
    }

    /**
     * Create a new broadcast room
     */
    async createRoom() {
        this.setState({startingRoom: true});

        try {
            const roomId = await this.rtcService.createRoom(this.broadcasterId);

            // Don't need to update state here as it will come through events
            // But ensure we have proper default state
            await this.refreshViewerLists();

            return true;
        } catch (error) {
            console.error('Error creating room:', error);
            this.setState({startingRoom: false});
            return false;
        }
    }

    /**
     * Reconnect to an existing room
     * @param {string} roomId - Room ID to reconnect to
     */
    async reconnectToRoom(roomId) {
        this.setState({startingRoom: true});

        try {
            await this.rtcService.reconnectToRoom(roomId, this.broadcasterId);
            return true;
        } catch (error) {
            console.error('Error reconnecting to room:', error);
            this.setState({startingRoom: false});
            return false;
        }
    }

    /**
     * Get or create a persistent viewer ID
     */
    getOrCreateViewerId() {
        // Check if we already have a stored viewer ID
        let viewerId = localStorage.getItem('viewerId');

        if (!viewerId) {
            // Generate a new ID if none exists
            viewerId = 'viewer_' + Math.random().toString(36).substring(2, 15) +
                Math.random().toString(36).substring(2, 15);
            localStorage.setItem('viewerId', viewerId);
        }

        return viewerId;
    }

    /**
     * Join a room as viewer with persistent ID
     */
    async joinRoom(roomId) {
        try {
            // Check if already viewing this room
            const existingRoom = this.state.roomsViewing.find(r => r.roomId === roomId);
            if (existingRoom) {
                console.log("Already viewing room:", roomId);
                return {status: 'approved', roomId};
            }

            // Get persistent viewer ID
            const viewerId = this.getOrCreateViewerId();
            console.log("Joining room with persistent viewerId:", viewerId);

            const result = await this.rtcService.joinRoom(roomId, viewerId);
            console.log("Join room result:", result);

            return result;
        } catch (error) {
            console.error('Error joining room:', error);
            return {status: 'error', error};
        }
    }

    /**
     * Hang up the current room
     * @param {boolean} keepRoom - Whether to keep the room in Firebase
     */
    async hangUp(keepRoom = false) {
        if (keepRoom) {
            this.rtcService.leaveRoom(this.state.myRoom);
        } else {
            this.rtcService.terminateRoom();
        }
    }

    /**
     * Handle leaving a specific room as a viewer
     * @param {string} roomId - Room ID to leave
     */
    async handleHangUp(roomId) {
        // Find the room in roomsViewing
        const roomIndex = this.state.roomsViewing.findIndex(r => r.roomId === roomId);

        if (roomIndex !== -1) {
            // Create a copy of roomsViewing without the room
            const roomsViewing = [...this.state.roomsViewing];
            roomsViewing.splice(roomIndex, 1);
            this.setState({roomsViewing});

            // Leave the room in the RTC service
            await this.rtcService.leaveRoom(this.state.myRoom);

            // Update URL if needed
            if (roomsViewing.length > 0) {
                const url = new URL(window.location);
                url.searchParams.set('roomId', roomsViewing[0].roomId);
                window.history.pushState({}, '', url);
            } else {
                const url = new URL(window.location);
                url.searchParams.delete('roomId');
                window.history.pushState({}, '', url);
            }
        }
    }

    /**
     * Toggle requiring approval for viewers
     */
    async toggleRequireApproval() {
        const newValue = !this.state.requireApproval;

        // Update local state immediately for responsiveness
        this.setState({requireApproval: newValue});

        if (this.state.myRoom) {
            try {
                await this.rtcService.updateRoomSettings({requireApproval: newValue});

                // If turning off approval, auto-approve all pending viewers
                if (newValue === false && this.state.pendingViewers.length > 0) {
                    const roomData = await this.rtcService.getRoomData();
                    const pendingViewers = roomData.pendingViewers || [];
                    const approvedViewers = roomData.approvedViewers || [];

                    // Move all pending to approved
                    const newApprovedViewers = [...new Set([...approvedViewers, ...pendingViewers])];

                    await this.rtcService.updateRoomSettings({
                        approvedViewers: newApprovedViewers,
                        pendingViewers: []
                    });

                    // Update local state immediately
                    this.setState({
                        approvedViewers: newApprovedViewers,
                        pendingViewers: []
                    });
                }

                return true;
            } catch (error) {
                console.error('Error updating approval setting:', error);
                // Revert local state on error
                this.setState({requireApproval: !newValue});
                return false;
            }
        }

        return true; // Return true if we're just updating local state
    }

    /**
     * Toggle visibility of room ID
     */
    toggleShowRoomId() {
        this.setState({showRoomId: !this.state.showRoomId});
    }

    /**
     * Toggle viewer management panel
     */
    toggleViewerManagement() {
        this.setState({showViewerManagement: !this.state.showViewerManagement});
    }

    /**
     * Copy room URL to clipboard
     */
    copyRoomUrl() {
        if (!this.state.myRoom) return false;

        try {
            const url = `${document.location.href}${document.location.href.indexOf('?') > -1 ? '&' : '?'}roomId=${this.state.myRoom}`;
            navigator.clipboard.writeText(url);
            return true;
        } catch (error) {
            console.error('Error copying URL:', error);
            return false;
        }
    }

    /**
     * Manage a viewer's access
     * @param {string} viewerId - Viewer ID to manage
     * @param {string} action - Action to take (approve, block, remove, unblock)
     */
    async manageViewer(viewerId, action) {
        try {
            await this.rtcService.manageViewer(viewerId, action);

            // Always refresh viewer lists after management action
            await this.refreshViewerLists();

            return true;
        } catch (error) {
            console.error('Error managing viewer:', error);
            return false;
        }
    }

    /**
     * Fetch the latest viewer lists
     */
    async refreshViewerLists() {
        if (!this.state.myRoom) return false;

        try {
            const roomData = await this.rtcService.getRoomData();
            this.setState({
                approvedViewers: roomData.approvedViewers || [],
                pendingViewers: roomData.pendingViewers || [],
                blockedViewers: roomData.blockedViewers || [],
                requireApproval: roomData.requireApproval !== undefined ? roomData.requireApproval : this.state.requireApproval
            });
            return true;
        } catch (error) {
            console.error('Error refreshing viewer lists:', error);
            return false;
        }
    }

    /**
     * Check for a previous broadcast room and offer to reconnect
     * @param {Function} onRoomFound - Callback when a valid room is found
     */
    async checkForPreviousBroadcast(onRoomFound) {
        const savedRoomId = localStorage.getItem('broadcasterRoom');
        const savedTimestamp = localStorage.getItem('broadcasterTimestamp');

        if (savedRoomId && savedTimestamp && this.broadcasterId) {
            const hourInMs = 60 * 60 * 1000;
            const timestamp = parseInt(savedTimestamp, 10);
            const now = Date.now();

            if (now - timestamp < hourInMs) {
                try {
                    // Verify the room exists and belongs to this broadcaster
                    const roomRef = window.fireDB.collection('rooms').doc(savedRoomId);
                    const roomSnapshot = await roomRef.get();

                    if (roomSnapshot.exists) {
                        const roomData = roomSnapshot.data();

                        if (roomData.broadcasterId === this.broadcasterId) {
                            // Valid room found
                            if (onRoomFound) {
                                onRoomFound(savedRoomId);
                            }
                            return true;
                        }
                    }
                } catch (error) {
                    console.error('Error checking previous broadcast:', error);
                }
            }

            // Room is too old or invalid, clean up
            localStorage.removeItem('broadcasterRoom');
            localStorage.removeItem('broadcasterTimestamp');
        }

        return false;
    }
}

export default RoomStore;
