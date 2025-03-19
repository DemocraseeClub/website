import Config from "../Config";
import WebRTCDiagnostics from "./WebRTCDiagnostics";

class WebRTCService {
    constructor() {
        this.peerConnection = null;
        this.localStreams = {
            camera: null,
            screen: null,
            merged: null
        };
        this.listeners = [];
        this.roomId = null;
        this.broadcasterId = null;
        this.merger = null;
        this.eventListeners = {};

        // Initialize WebRTC diagnostics
        WebRTCDiagnostics.addToWebRTCService(this);
        WebRTCDiagnostics.setupDiagnosticLogging();
    }

    // Singleton pattern
    static getInstance() {
        if (!WebRTCService.instance) {
            WebRTCService.instance = new WebRTCService();
        }
        return WebRTCService.instance;
    }

    /**
     * Create a new RTCPeerConnection
     */
    createPeerConnection() {
        console.log('Create PeerConnection with configuration:', Config.peerConfig);

        if (this.peerConnection) {
            console.log('Closing existing peer connection before creating new one');
            this.peerConnection.close();
        }

        this.peerConnection = new RTCPeerConnection(Config.peerConfig);

        // Enhanced event logging
        this.peerConnection.addEventListener('icegatheringstatechange', () => {
            console.log(`ICE gathering state changed: ${this.peerConnection.iceGatheringState}`);
        });

        this.peerConnection.addEventListener('connectionstatechange', () => {
            console.log(`Connection state change: ${this.peerConnection.connectionState}`);

            // Log more details about connection state
            if (this.peerConnection.connectionState === 'connected') {
                console.log('WebRTC connection established successfully');
                this.logConnectionStats(); // Added stats logging
            } else if (this.peerConnection.connectionState === 'failed') {
                console.error('WebRTC connection failed');
                this.notifyListeners('connectionError', {
                    error: 'Connection failed',
                    state: this.peerConnection.connectionState
                });
            }

            // Notify listeners about connection state changes
            this.notifyListeners('connectionStateChange', {
                state: this.peerConnection.connectionState
            });
        });

        this.peerConnection.addEventListener('signalingstatechange', () => {
            console.log(`Signaling state change: ${this.peerConnection.signalingState}`);
        });

        this.peerConnection.addEventListener('iceconnectionstatechange', () => {
            console.log(`ICE connection state change: ${this.peerConnection.iceConnectionState}`);

            // Add specific handling for failed ICE connections
            if (this.peerConnection.iceConnectionState === 'failed') {
                console.error('ICE connection failed - attempting ICE restart');
                this.restartIce();
            }
        });

        // Track event handler - CRITICAL for receiving remote streams
        this.peerConnection.addEventListener('track', event => {
            console.log('Remote track received:', event);
            console.log('Track info:', {
                kind: event.track.kind,
                enabled: event.track.enabled,
                readyState: event.track.readyState,
                id: event.track.id,
                label: event.track.label, // This often indicates screen sharing
            });

            // Ensure we're working with the event streams array
            if (event.streams && event.streams.length > 0) {
                const remoteStream = event.streams[0];

                // Add ended event listeners to track stream lifecycle
                remoteStream.getTracks().forEach(track => {
                    track.addEventListener('ended', () => {
                        console.log(`Remote ${track.kind} track ended`);
                    });
                });

                // Notify listeners with the actual stream from the event
                this.notifyListeners('remoteStreamReceived', {
                    stream: remoteStream,
                    roomId: this.roomId
                });
            } else {
                console.warn('Received track event without stream');
            }
        });

        // Debug the state of the connection
        console.log('Peer connection created with initial states:', {
            signalingState: this.peerConnection.signalingState,
            iceGatheringState: this.peerConnection.iceGatheringState,
            iceConnectionState: this.peerConnection.iceConnectionState,
            connectionState: this.peerConnection.connectionState
        });

        return this.peerConnection;
    }

    logConnectionStats() {
        if (!this.peerConnection) return;

        this.peerConnection.getStats()
            .then(stats => {
                const statsData = {
                    inbound: [],
                    outbound: [],
                    candidatePairs: []
                };

                stats.forEach(stat => {
                    if (stat.type === 'inbound-rtp') {
                        statsData.inbound.push({
                            kind: stat.kind,
                            packetsReceived: stat.packetsReceived,
                            packetsLost: stat.packetsLost,
                            bytesReceived: stat.bytesReceived,
                            jitter: stat.jitter
                        });
                    } else if (stat.type === 'outbound-rtp') {
                        statsData.outbound.push({
                            kind: stat.kind,
                            packetsSent: stat.packetsSent,
                            bytesSent: stat.bytesSent
                        });
                    } else if (stat.type === 'candidate-pair' && stat.state === 'succeeded') {
                        statsData.candidatePairs.push({
                            localCandidateId: stat.localCandidateId,
                            remoteCandidateId: stat.remoteCandidateId,
                            rtt: stat.currentRoundTripTime,
                            bytesSent: stat.bytesSent,
                            bytesReceived: stat.bytesReceived
                        });
                    }
                });

                console.log('Connection stats:', statsData);

                // Look for potential issues
                if (statsData.inbound.length === 0 && statsData.outbound.length > 0) {
                    console.warn('Sending media but not receiving any - check remote side');
                } else if (statsData.inbound.length > 0 && statsData.outbound.length === 0) {
                    console.warn('Receiving media but not sending any - check local streams');
                }

                if (statsData.candidatePairs.length === 0) {
                    console.warn('No successful candidate pairs - possible connectivity issue');
                }
            })
            .catch(error => {
                console.error('Error getting stats:', error);
            });
    }

    /**
     * Attempt to restart ICE negotiation
     */
    restartIce() {
        if (!this.peerConnection) return;

        try {
            console.log('Attempting ICE restart');

            // For broadcaster, create a new offer with ICE restart
            if (this.roomId && this.broadcasterId) {
                this.peerConnection.createOffer({iceRestart: true})
                    .then(offer => {
                        return this.peerConnection.setLocalDescription(offer);
                    })
                    .then(() => {
                        // Update the room with new offer
                        const roomRef = window.fireDB.collection('rooms').doc(this.roomId);
                        return roomRef.update({
                            'offer': {
                                type: this.peerConnection.localDescription.type,
                                sdp: this.peerConnection.localDescription.sdp
                            }
                        });
                    })
                    .then(() => {
                        console.log('ICE restart offer sent');
                    })
                    .catch(error => {
                        console.error('Error during ICE restart:', error);
                    });
            }
        } catch (error) {
            console.error('Failed to restart ICE:', error);
        }
    }

    /**
     * Add all active local streams to the peer connection
     */
    addLocalStreamsToPeerConnection() {
        if (!this.peerConnection) {
            console.warn('No peer connection available for adding tracks');
            return;
        }

        // Remove any existing tracks first to avoid duplicates
        const senders = this.peerConnection.getSenders();
        senders.forEach(sender => {
            if (sender.track) {
                try {
                    console.log(`Removing track: ${sender.track.kind}`);
                    this.peerConnection.removeTrack(sender);
                } catch (error) {
                    console.warn("Error removing track:", error);
                }
            }
        });

        // Add tracks from the appropriate stream
        const streamToUse = this.localStreams.merged || this.localStreams.screen || this.localStreams.camera;

        if (streamToUse) {
            console.log(`Adding tracks from ${streamToUse === this.localStreams.merged ? 'merged' :
                streamToUse === this.localStreams.screen ? 'screen' : 'camera'} stream`);

            streamToUse.getTracks().forEach(track => {
                console.log(`Adding track: ${track.kind}, enabled: ${track.enabled}, muted: ${track.muted}`);
                this.peerConnection.addTrack(track, streamToUse);
            });

            // Log the senders after adding
            const updatedSenders = this.peerConnection.getSenders();
            console.log(`Peer connection now has ${updatedSenders.length} senders`);
        } else {
            console.warn('No local stream available to add to peer connection');
        }
    }

    /**
     * Toggle camera/microphone
     * @param {string} type - 'video' or 'audio'
     * @param {boolean} enabled - Whether to enable or disable
     */
    async toggleMedia(type, enabled) {
        try {
            if (enabled) {
                // Create constraints based on type
                const constraints = {};
                constraints[type] = true;

                // Get user media stream
                const stream = await navigator.mediaDevices.getUserMedia(constraints);

                // If we already have a camera stream, add the new tracks
                if (this.localStreams.camera) {
                    // For existing streams, we need to handle tracks appropriately
                    const existingStream = this.localStreams.camera;

                    if (type === 'video') {
                        // Remove any existing video tracks
                        existingStream.getVideoTracks().forEach(track => {
                            existingStream.removeTrack(track);
                            track.stop();
                        });

                        // Add the new video track
                        stream.getVideoTracks().forEach(track => {
                            existingStream.addTrack(track);
                        });
                    } else if (type === 'audio') {
                        // Remove any existing audio tracks
                        existingStream.getAudioTracks().forEach(track => {
                            existingStream.removeTrack(track);
                            track.stop();
                        });

                        // Add the new audio track
                        stream.getAudioTracks().forEach(track => {
                            existingStream.addTrack(track);
                        });
                    }
                } else {
                    // If no existing stream, use the new one
                    this.localStreams.camera = stream;
                }
            } else {
                // If disabling, stop the relevant tracks
                if (this.localStreams.camera) {
                    if (type === 'video') {
                        this.localStreams.camera.getVideoTracks().forEach(track => {
                            track.enabled = false;
                            track.stop();
                            this.localStreams.camera.removeTrack(track);
                        });
                    } else if (type === 'audio') {
                        this.localStreams.camera.getAudioTracks().forEach(track => {
                            track.enabled = false;
                            track.stop();
                            this.localStreams.camera.removeTrack(track);
                        });
                    }

                    // If no tracks left, null out the stream
                    if (this.localStreams.camera.getTracks().length === 0) {
                        this.localStreams.camera = null;
                    }
                }
            }

            // Update the merged stream
            this.updateMergedStream();

            // Notify listeners
            this.notifyListeners('mediaToggled', {type, enabled});

            return true;
        } catch (error) {
            console.error(`Error toggling ${type}:`, error);
            // Notify listeners of the error
            this.notifyListeners('mediaError', {type, error: error.message});
            return false;
        }
    }

    /**
     * Check if video is enabled
     */
    isVideoEnabled() {
        if (!this.localStreams.camera) return false;
        const videoTracks = this.localStreams.camera.getVideoTracks();
        return videoTracks.length > 0 && videoTracks[0].enabled;
    }

    /**
     * Check if audio is enabled
     */
    isAudioEnabled() {
        if (!this.localStreams.camera) return false;
        const audioTracks = this.localStreams.camera.getAudioTracks();
        return audioTracks.length > 0 && audioTracks[0].enabled;
    }

    /**
     * Toggle screen sharing
     * @param {boolean} enabled - Whether to enable or disable
     */
    async toggleScreenShare(enabled) {
        try {
            if (enabled) {
                // Get screen share stream with more specific constraints
                const stream = await navigator.mediaDevices.getDisplayMedia({
                    video: {
                        cursor: "always",
                        displaySurface: "monitor"
                    },
                    audio: true // Try to capture audio too if available
                }).catch(err => {
                    console.error("Error getting display media:", err);
                    throw err;
                });

                console.log(`Got screen share stream with ${stream.getTracks().length} tracks: `,
                    stream.getTracks().map(t => `${t.kind}:${t.label}`));

                // Stop any existing screen tracks before replacing
                if (this.localStreams.screen) {
                    this.localStreams.screen.getTracks().forEach(track => {
                        track.stop();
                        console.log(`Stopped track: ${track.kind}`);
                    });
                }

                this.localStreams.screen = stream;

                // Set up track ended handler
                stream.getTracks().forEach(track => {
                    track.onended = () => {
                        console.log(`Screen share ${track.kind} track ended by user`);
                        // Only handle screen stopping if we still have screen share enabled
                        if (this.localStreams.screen) {
                            this.toggleScreenShare(false);
                            this.notifyListeners('mediaToggled', {type: 'screen', enabled: false});
                        }
                    };
                });
            } else {
                // Stop screen sharing tracks
                if (this.localStreams.screen) {
                    this.localStreams.screen.getTracks().forEach(track => {
                        track.stop();
                        console.log(`Stopped ${track.kind} track: ${track.label}`);
                    });
                    this.localStreams.screen = null;
                }
            }

            // Update the merged stream
            this.updateMergedStream();

            // Needs negotiation if we have an active connection
            if (this.peerConnection &&
                (this.peerConnection.connectionState === 'connected' ||
                    this.peerConnection.connectionState === 'connecting')) {
                await this.renegotiateConnection();
            }

            // Notify listeners
            this.notifyListeners('mediaToggled', {type: 'screen', enabled});

            return true;
        } catch (error) {
            console.error('Error toggling screen share:', error);
            this.notifyListeners('mediaError', {type: 'screen', error: error.message});
            return false;
        }
    }

    async renegotiateConnection() {
        if (!this.peerConnection) return;

        try {
            console.log("Renegotiating connection after media change");

            // Create a new offer with iceCandidates in flight
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);

            console.log("Created new offer for renegotiation:", {
                type: offer.type,
                sdpLength: offer.sdp.length
            });

            // If we're the broadcaster
            if (this.roomId && this.broadcasterId) {
                const roomRef = window.fireDB.collection('rooms').doc(this.roomId);
                await roomRef.update({
                    'offer': {type: offer.type, sdp: offer.sdp},
                    'renegotiated': new Date().toISOString() // Add timestamp to track renegotiation
                });
                console.log("Updated room with new offer for renegotiation");
            }
            // For viewers with active connections - this implementation would need expansion
            else if (this.roomId && this.viewerId) {
                // This is a simplified version - would need more work for bidirectional
                console.log("Viewer renegotiation not fully implemented yet");
            }
        } catch (error) {
            console.error("Error renegotiating connection:", error);
        }
    }

    /**
     * Merge camera and screen streams if both are active
     */
    updateMergedStream() {
        try {
            // Clean up old merger if it exists
            if (this.merger) {
                this.merger.stop();
                this.merger = null;
            }

            this.localStreams.merged = null;

            if (this.localStreams.screen && this.localStreams.camera) {
                console.log("Attempting to merge video and camera streams")
                // Create new merger
                const VideoStreamMerger = require('video-stream-merger');
                this.merger = new VideoStreamMerger();

                // Add screen stream filling the canvas
                this.merger.addStream(this.localStreams.screen, {
                    x: 0,
                    y: 0,
                    width: this.merger.width,
                    height: this.merger.height,
                    mute: true
                });

                // Add camera stream in bottom corner
                this.merger.addStream(this.localStreams.camera, {
                    x: 0,
                    y: this.merger.height - Math.round(this.merger.height / 6),
                    width: Math.round(this.merger.width / 6),
                    height: Math.round(this.merger.height / 6),
                    mute: !this.isAudioEnabled()
                });

                // Start merging
                this.merger.start();
                this.localStreams.merged = this.merger.result;
            } else if (this.localStreams.screen) {
                this.localStreams.merged = this.localStreams.screen;
            } else if (this.localStreams.camera) {
                this.localStreams.merged = this.localStreams.camera;
            }

            // If the peer connection exists, update the tracks
            if (this.peerConnection) {
                // Remove existing tracks
                const senders = this.peerConnection.getSenders();
                senders.forEach(sender => {
                    try {
                        this.peerConnection.removeTrack(sender);
                    } catch (error) {
                        console.warn("Error removing track:", error);
                        // Continue despite error
                    }
                });

                // Add the new stream tracks
                this.addLocalStreamsToPeerConnection();
            }

            // Notify listeners that the stream has been updated
            this.notifyListeners('streamUpdated', {
                stream: this.localStreams.merged || this.localStreams.screen || this.localStreams.camera
            });
        } catch (error) {
            console.error("Error updating merged stream:", error);
            this.notifyListeners('mediaError', {error: error.message});
        }
    }

    /**
     * Clean up all media streams
     */
    stopAllStreams() {
        ['camera', 'screen', 'merged'].forEach(streamType => {
            if (this.localStreams[streamType]) {
                this.localStreams[streamType].getTracks().forEach(track => track.stop());
                this.localStreams[streamType] = null;
            }
        });

        if (this.merger) {
            this.merger.stop();
            this.merger = null;
        }
    }

    /**
     * Common setup for room-related peer connections
     * @param {string} roomId - Room ID to use (null for new room)
     * @param {string} broadcasterId - Broadcaster's unique ID
     * @returns {Object} - Contains roomRef and roomId
     */
    async setupRoomConnection(roomId = null, broadcasterId) {
        // Get room reference - either existing or new
        const roomRef = roomId ?
            window.fireDB.collection('rooms').doc(roomId) :
            window.fireDB.collection('rooms').doc();

        // Set room ID
        this.roomId = roomRef.id;
        this.broadcasterId = broadcasterId;

        // Create peer connection if it doesn't exist
        if (!this.peerConnection) {
            this.createPeerConnection();
        }

        // Set up ICE candidate collection
        const callerCandidatesCollection = roomRef.collection('callerCandidates');
        this.peerConnection.addEventListener('icecandidate', event => {
            if (event.candidate) {
                console.log('Got ICE candidate:', event.candidate);
                callerCandidatesCollection.add(event.candidate.toJSON());
            }
        });

        // Add local streams to the connection
        this.addLocalStreamsToPeerConnection();

        // Create offer
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        console.log("Local description set, ICE gathering should start now");

        return {roomRef, roomId: this.roomId, offer};
    }

    /**
     * Set up common listeners for room events
     * @param {Object} roomRef - Reference to the room document
     */
    setupRoomListeners(roomRef) {
        // Set up listeners for remote answers and candidates
        const roomListener = roomRef.onSnapshot(async snapshot => {
            const data = snapshot.data();
            if (!data) return;

            // If we have a remote answer but haven't set it yet
            if (!this.peerConnection.currentRemoteDescription && data.answer) {
                console.log('Got remote description:', data.answer);
                const rtcSessionDescription = new RTCSessionDescription(data.answer);
                await this.peerConnection.setRemoteDescription(rtcSessionDescription);
            }

            // Notify listeners of viewer count changes
            this.notifyListeners('viewerCountChanged', {
                count: data.viewers || 0,
                viewers: data.roomsViewing || []
            });
        });

        const candidatesListener = roomRef.collection('calleeCandidates').onSnapshot(snapshot => {
            snapshot.docChanges().forEach(async change => {
                if (change.type === 'added') {
                    const data = change.doc.data();
                    console.log('Got new remote ICE candidate:', data);
                    try {
                        await this.peerConnection.addIceCandidate(new RTCIceCandidate(data));
                    } catch (error) {
                        console.error('Error adding ICE candidate:', error);
                    }
                }
            });
        });

        // Store listeners for cleanup
        this.listeners.push(roomListener);
        this.listeners.push(candidatesListener);
    }

    /**
     * Create a new room as broadcaster
     * @param {string} broadcasterId - Unique ID for the broadcaster
     */
    async createRoom(broadcasterId) {
        try {
            // Set up the room connection and get references
            const {roomRef, roomId, offer} = await this.setupRoomConnection(null, broadcasterId);

            // Create room with offer and metadata
            const roomData = {
                'offer': {type: offer.type, sdp: offer.sdp},
                viewers: 0,
                roomsViewing: [],
                requireApproval: true, // Default to requiring approval
                approvedViewers: [],
                pendingViewers: [],
                blockedViewers: [],
                broadcasterId: broadcasterId,
                createdAt: new Date().toISOString()
            };

            await roomRef.set(roomData);

            // Set up common room listeners
            this.setupRoomListeners(roomRef);

            // Notify listeners that room was created
            this.notifyListeners('roomCreated', {roomId: this.roomId});

            return this.roomId;
        } catch (error) {
            console.error('Error creating room:', error);
            throw error;
        }
    }

    /**
     * Reconnect to an existing room as broadcaster
     * @param {string} roomId - ID of the room to reconnect to
     * @param {string} broadcasterId - Broadcaster ID for verification
     */
    async reconnectToRoom(roomId, broadcasterId) {
        try {
            // Verify the room exists and broadcaster ID matches
            const roomRef = window.fireDB.collection('rooms').doc(roomId);
            const roomSnapshot = await roomRef.get();

            if (!roomSnapshot.exists) {
                throw new Error('Room does not exist');
            }

            const roomData = roomSnapshot.data();

            // Verify broadcaster ID
            if (roomData.broadcasterId !== broadcasterId) {
                throw new Error('Broadcaster ID mismatch');
            }

            // Clear out old ICE candidates
            console.log('Clearing previous ICE candidates');
            const callerCandidatesCollection = roomRef.collection('callerCandidates');
            const candidatesSnapshot = await callerCandidatesCollection.get();
            const deletePromises = candidatesSnapshot.docs.map(doc => doc.ref.delete());
            await Promise.all(deletePromises);

            // Set up the room connection
            const {offer} = await this.setupRoomConnection(roomId, broadcasterId);

            // Update room with new offer and reconnection data
            await roomRef.update({
                'offer': {type: offer.type, sdp: offer.sdp},
                'reconnectedAt': new Date().toISOString(),
                'broadcasterReconnected': true
            });

            // Set up common room listeners
            this.setupRoomListeners(roomRef);

            // Notify listeners that room was reconnected
            this.notifyListeners('roomReconnected', {roomId: this.roomId});

            return this.roomId;
        } catch (error) {
            console.error('Error reconnecting to room:', error);
            throw error;
        }
    }

    /**
     * Join a room as a viewer
     * @param {string} roomId - ID of the room to join
     * @param {string} viewerId - ID of the viewer (optional)
     */
    async joinRoom(roomId, viewerId = null) {
        try {
            console.log("Joining room:", roomId, "with viewerId:", viewerId);

            const roomRef = window.fireDB.collection('rooms').doc(roomId);
            const roomSnapshot = await roomRef.get();

            if (!roomSnapshot.exists) {
                throw new Error('Room does not exist');
            }

            const roomData = roomSnapshot.data();

            // Debug the room data to help diagnose issues
            console.log("Room data when joining:", {
                roomId,
                viewers: roomData.viewers,
                roomsViewing: roomData.roomsViewing || [],
                approvedViewers: roomData.approvedViewers || []
            });

            // Check if viewer is blocked
            if (viewerId && roomData.blockedViewers && roomData.blockedViewers.includes(viewerId)) {
                throw new Error('Viewer is blocked');
            }

            // Generate a unique viewerId if not provided or if it's the same as the roomId
            // This prevents confusion between broadcaster and viewer IDs
            if (!viewerId || viewerId === roomId) {
                viewerId = 'viewer_' + Math.random().toString(36).substring(2, 15);
                console.log("Generated new viewerId:", viewerId);
            }

            // Handle approval if required
            if (roomData.requireApproval && viewerId) {
                // If not already approved
                if (!roomData.approvedViewers || !roomData.approvedViewers.includes(viewerId)) {
                    // If not already pending
                    if (!roomData.pendingViewers || !roomData.pendingViewers.includes(viewerId)) {
                        // Add to pending list
                        const pendingViewers = roomData.pendingViewers || [];
                        await roomRef.update({
                            pendingViewers: [...pendingViewers, viewerId]
                        });
                    }

                    // Return pending status
                    return {status: 'pending', roomId, viewerId};
                }
            } else if (viewerId) {
                // No approval required, auto-approve if not already approved
                if (!roomData.approvedViewers || !roomData.approvedViewers.includes(viewerId)) {
                    const approvedViewers = roomData.approvedViewers || [];
                    await roomRef.update({
                        approvedViewers: [...approvedViewers, viewerId]
                    });
                }
            }

            // Create peer connection
            this.createPeerConnection();

            // Set up event listener for remote tracks with improved logging
            this.peerConnection.addEventListener('track', event => {
                console.log('Remote track received:', event.streams[0]);
                console.log('Track info:', {
                    kind: event.track.kind,
                    enabled: event.track.enabled,
                    readyState: event.track.readyState
                });

                // Store the roomId and viewerId to help with event filtering
                this.notifyListeners('remoteStreamReceived', {
                    stream: event.streams[0],
                    roomId: roomId,
                    viewerId: viewerId
                });
            });

            // Set up ICE candidate collection
            const calleeCandidatesCollection = roomRef.collection('calleeCandidates');
            this.peerConnection.addEventListener('icecandidate', event => {
                if (event.candidate) {
                    console.log('Got ICE candidate as viewer:', event.candidate);
                    calleeCandidatesCollection.add(event.candidate.toJSON());
                }
            });

            // Additional connection state logging
            this.peerConnection.addEventListener('connectionstatechange', () => {
                console.log(`Connection state changed to: ${this.peerConnection.connectionState}`);
            });

            this.peerConnection.addEventListener('iceconnectionstatechange', () => {
                console.log(`ICE connection state changed to: ${this.peerConnection.iceConnectionState}`);
            });

            // Process remote offer
            const offer = roomData.offer;
            if (!offer) {
                throw new Error('No offer found in room');
            }

            console.log("Setting remote description with offer:", offer);
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

            // Create answer
            console.log("Creating answer");
            const answer = await this.peerConnection.createAnswer();
            console.log("Setting local description with answer");
            await this.peerConnection.setLocalDescription(answer);

            // Update room with answer
            console.log("Updating room with answer");
            await roomRef.update({
                answer: {type: answer.type, sdp: answer.sdp}
            });

            // Update viewer count if we have a viewerId
            if (viewerId) {
                const roomsViewing = roomData.roomsViewing || [];
                if (!roomsViewing.includes(viewerId)) {
                    console.log("Adding viewerId to roomsViewing:", viewerId);
                    await roomRef.update({
                        roomsViewing: [...roomsViewing, viewerId],
                        viewers: (roomsViewing.length + 1)
                    });
                }
            }

            // Listen for remote ICE candidates
            const candidatesListener = roomRef.collection('callerCandidates').onSnapshot(snapshot => {
                snapshot.docChanges().forEach(async change => {
                    if (change.type === 'added') {
                        const data = change.doc.data();
                        console.log('Got new broadcaster ICE candidate:', data);
                        await this.peerConnection.addIceCandidate(new RTCIceCandidate(data));
                    }
                });
            });

            // Listen for offer changes (broadcaster reconnection)
            const roomListener = roomRef.onSnapshot(async snapshot => {
                if (!snapshot.exists) {
                    // Room was deleted
                    this.hangUp();
                    this.notifyListeners('roomClosed', {roomId});
                    return;
                }

                const data = snapshot.data();

                // If approval status changed
                if (viewerId) {
                    if (data.blockedViewers && data.blockedViewers.includes(viewerId)) {
                        this.hangUp();
                        this.notifyListeners('accessBlocked', {roomId});
                        return;
                    }

                    if (data.requireApproval &&
                        (!data.approvedViewers || !data.approvedViewers.includes(viewerId))) {
                        // We're no longer approved
                        this.hangUp();
                        this.notifyListeners('accessRevoked', {roomId});
                        return;
                    }
                }

                // If offer changed (broadcaster reconnected)
                if (data.offer && this.peerConnection.remoteDescription) {
                    const currentOffer = this.peerConnection.remoteDescription.sdp;
                    if (data.offer.sdp !== currentOffer) {
                        console.log('Broadcaster reconnected with new offer');

                        // Create new answer for the new offer
                        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
                        const newAnswer = await this.peerConnection.createAnswer();
                        await this.peerConnection.setLocalDescription(newAnswer);

                        // Update room with new answer
                        await roomRef.update({
                            answer: {type: newAnswer.type, sdp: newAnswer.sdp}
                        });

                        this.notifyListeners('broadcasterReconnected', {roomId});
                    }
                }
            });

            // Store listeners for cleanup
            this.listeners.push(roomListener);
            this.listeners.push(candidatesListener);

            this.roomId = roomId;
            this.viewerId = viewerId; // Store the viewerId

            // Notify listeners that room was joined
            this.notifyListeners('roomJoined', {
                roomId,
                viewerId,
                status: 'approved'
            });

            return {status: 'approved', roomId, viewerId};
        } catch (error) {
            console.error('Error joining room:', error);
            throw error;
        }
    }

    /**
     * Update room settings
     * @param {Object} settings - Settings to update
     */
    async updateRoomSettings(settings) {
        if (!this.roomId) {
            throw new Error('No active room');
        }

        try {
            const roomRef = window.fireDB.collection('rooms').doc(this.roomId);
            await roomRef.update(settings);

            // Notify listeners that settings were updated
            this.notifyListeners('roomSettingsUpdated', {settings});

            return true;
        } catch (error) {
            console.error('Error updating room settings:', error);
            throw error;
        }
    }

    /**
     * Get current room data
     */
    async getRoomData() {
        if (!this.roomId) {
            throw new Error('No active room');
        }

        try {
            const roomRef = window.fireDB.collection('rooms').doc(this.roomId);
            const snapshot = await roomRef.get();

            if (!snapshot.exists) {
                throw new Error('Room does not exist');
            }

            return snapshot.data();
        } catch (error) {
            console.error('Error getting room data:', error);
            throw error;
        }
    }

    /**
     * Manage viewer access
     * @param {string} viewerId - ID of the viewer
     * @param {string} action - Action to take (approve, block, remove, unblock)
     */
    async manageViewer(viewerId, action) {
        if (!this.roomId) {
            throw new Error('No active room');
        }

        try {
            const roomRef = window.fireDB.collection('rooms').doc(this.roomId);
            const roomData = await this.getRoomData();

            const approvedViewers = roomData.approvedViewers || [];
            const pendingViewers = roomData.pendingViewers || [];
            const blockedViewers = roomData.blockedViewers || [];
            const roomsViewing = roomData.roomsViewing || [];

            switch (action) {
                case 'approve':
                    // Move from pending to approved
                    await roomRef.update({
                        approvedViewers: [...approvedViewers, viewerId],
                        pendingViewers: pendingViewers.filter(id => id !== viewerId)
                    });
                    break;

                case 'block':
                    // Remove from all other lists and add to blocked
                    await roomRef.update({
                        approvedViewers: approvedViewers.filter(id => id !== viewerId),
                        pendingViewers: pendingViewers.filter(id => id !== viewerId),
                        roomsViewing: roomsViewing.filter(id => id !== viewerId),
                        blockedViewers: [...blockedViewers, viewerId],
                        viewers: roomsViewing.filter(id => id !== viewerId).length
                    });
                    break;

                case 'remove':
                    // Remove from all lists
                    await roomRef.update({
                        approvedViewers: approvedViewers.filter(id => id !== viewerId),
                        pendingViewers: pendingViewers.filter(id => id !== viewerId),
                        roomsViewing: roomsViewing.filter(id => id !== viewerId),
                        viewers: roomsViewing.filter(id => id !== viewerId).length
                    });
                    break;

                case 'unblock':
                    // Remove from blocked list
                    await roomRef.update({
                        blockedViewers: blockedViewers.filter(id => id !== viewerId)
                    });
                    break;
            }

            // Notify listeners that viewer was managed
            this.notifyListeners('viewerManaged', {viewerId, action});

            return true;
        } catch (error) {
            console.error('Error managing viewer:', error);
            throw error;
        }
    }

    /**
     * Leave a room as a viewer
     * @param {string} viewerId - ID of the viewer (optional)
     */
    async leaveRoom(viewerId = null) {
        if (!this.roomId) return;

        try {
            // Update viewer count if we have a viewerId
            if (viewerId) {
                const roomRef = window.fireDB.collection('rooms').doc(this.roomId);
                const roomData = await this.getRoomData();

                const roomsViewing = roomData.roomsViewing || [];
                if (roomsViewing.includes(viewerId)) {
                    await roomRef.update({
                        roomsViewing: roomsViewing.filter(id => id !== viewerId),
                        viewers: roomsViewing.filter(id => id !== viewerId).length
                    });
                }
            }
        } catch (error) {
            console.error('Error leaving room:', error);
        }

        // Clean up connection
        this.hangUp();
    }

    /**
     * Terminate a room as broadcaster
     */
    async terminateRoom() {
        if (!this.roomId) return;

        try {
            const roomRef = window.fireDB.collection('rooms').doc(this.roomId);

            // Delete ICE candidates
            const calleeCandidates = await roomRef.collection('calleeCandidates').get();
            calleeCandidates.forEach(async doc => {
                await doc.ref.delete();
            });

            const callerCandidates = await roomRef.collection('callerCandidates').get();
            callerCandidates.forEach(async doc => {
                await doc.ref.delete();
            });

            // Delete room
            await roomRef.delete();

            // Clean up
            this.hangUp();

            // Notify listeners that room was terminated
            this.notifyListeners('roomTerminated', {roomId: this.roomId});

            this.roomId = null;
            this.broadcasterId = null;
        } catch (error) {
            console.error('Error terminating room:', error);
            throw error;
        }
    }

    /**
     * Hangup and clean up
     */
    hangUp() {
        // Close peer connection
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }

        // Clean up media streams
        this.stopAllStreams();

        // Clean up listeners
        this.listeners.forEach(listener => {
            if (typeof listener === 'function') {
                listener();
            }
        });
        this.listeners = [];

        // Notify listeners
        this.notifyListeners('hungUp', {});
    }

    /**
     * Subscribe to events
     * @param {Function} callback - Function to call when events occur
     * @returns {Function} Unsubscribe function
     */
    subscribe(callback) {
        const id = Math.random().toString(36).substring(2, 15);
        this.eventListeners = this.eventListeners || {};
        this.eventListeners[id] = callback;

        // Return unsubscribe function
        return () => {
            delete this.eventListeners[id];
        };
    }

    /**
     * Notify all listeners of an event
     * @param {string} eventType - Type of event
     * @param {Object} data - Event data
     */
    notifyListeners(eventType, data) {
        if (!this.eventListeners) return;

        // Add debugging for important events
        if (['remoteStreamReceived', 'roomCreated', 'roomReconnected', 'roomJoined', 'hungUp', 'connectionError', 'iceConnectionFailed'].includes(eventType)) {
            console.log(`Notifying listeners of ${eventType} event:`, data);
        }

        Object.values(this.eventListeners).forEach(callback => {
            try {
                callback(eventType, data);
            } catch (error) {
                console.error(`Error in event listener for ${eventType}:`, error);
            }
        });
    }
}

export default WebRTCService;
