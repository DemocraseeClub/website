// WebRTCDiagnostics.js
// Add this file to your project and import it where needed

class WebRTCDiagnostics {
    static logConnectionStats(peerConnection, label = "WebRTC Connection") {
        if (!peerConnection) {
            console.warn("No peer connection to log stats for");
            return;
        }

        console.group(`${label} - Connection States`);
        console.log(`Signaling State: ${peerConnection.signalingState}`);
        console.log(`ICE Connection State: ${peerConnection.iceConnectionState}`);
        console.log(`ICE Gathering State: ${peerConnection.iceGatheringState}`);
        console.log(`Connection State: ${peerConnection.connectionState}`);
        console.groupEnd();

        // Get and log detailed stats
        peerConnection.getStats()
            .then(stats => {
                console.group(`${label} - Detailed Stats`);

                let inboundStats = [];
                let outboundStats = [];
                let candidatePairStats = [];

                stats.forEach(stat => {
                    if (stat.type === 'inbound-rtp') {
                        inboundStats.push(stat);
                    } else if (stat.type === 'outbound-rtp') {
                        outboundStats.push(stat);
                    } else if (stat.type === 'candidate-pair' && stat.state === 'succeeded') {
                        candidatePairStats.push(stat);
                    }
                });

                console.log("Active Candidate Pairs:", candidatePairStats.length);
                candidatePairStats.forEach(pair => {
                    console.log(`Candidate Pair: ${pair.localCandidateId} -> ${pair.remoteCandidateId}`);
                    console.log(`  Round Trip Time: ${pair.currentRoundTripTime}`);
                    console.log(`  Bytes Sent: ${pair.bytesSent}, Bytes Received: ${pair.bytesReceived}`);
                });

                console.log("Inbound Streams:", inboundStats.length);
                inboundStats.forEach(stat => {
                    console.log(`Track Type: ${stat.kind}, Packets Received: ${stat.packetsReceived}`);
                    console.log(`  Packets Lost: ${stat.packetsLost}, Jitter: ${stat.jitter}`);
                });

                console.log("Outbound Streams:", outboundStats.length);
                outboundStats.forEach(stat => {
                    console.log(`Track Type: ${stat.kind}, Packets Sent: ${stat.packetsSent}`);
                    console.log(`  Bytes Sent: ${stat.bytesSent}`);
                });

                console.groupEnd();
            })
            .catch(err => {
                console.error("Error getting WebRTC stats:", err);
            });
    }

    static logMediaStreamInfo(stream, label = "Media Stream") {
        if (!stream) {
            console.warn("No stream to log info for");
            return;
        }

        console.group(`${label} Info - ID: ${stream.id}`);

        const videoTracks = stream.getVideoTracks();
        console.log(`Video Tracks: ${videoTracks.length}`);
        videoTracks.forEach((track, i) => {
            console.group(`Video Track ${i + 1}`);
            console.log(`ID: ${track.id}`);
            console.log(`Label: ${track.label}`);
            console.log(`Enabled: ${track.enabled}`);
            console.log(`Ready State: ${track.readyState}`);
            console.log(`Muted: ${track.muted}`);

            // Get constraints if available
            try {
                const constraints = track.getConstraints();
                console.log("Constraints:", constraints);
            } catch (e) {
                console.log("Could not get constraints");
            }

            // Get settings if available
            try {
                const settings = track.getSettings();
                console.log("Settings:", settings);
            } catch (e) {
                console.log("Could not get settings");
            }

            console.groupEnd();
        });

        const audioTracks = stream.getAudioTracks();
        console.log(`Audio Tracks: ${audioTracks.length}`);
        audioTracks.forEach((track, i) => {
            console.group(`Audio Track ${i + 1}`);
            console.log(`ID: ${track.id}`);
            console.log(`Label: ${track.label}`);
            console.log(`Enabled: ${track.enabled}`);
            console.log(`Ready State: ${track.readyState}`);
            console.log(`Muted: ${track.muted}`);

            // Get constraints if available
            try {
                const constraints = track.getConstraints();
                console.log("Constraints:", constraints);
            } catch (e) {
                console.log("Could not get constraints");
            }

            // Get settings if available
            try {
                const settings = track.getSettings();
                console.log("Settings:", settings);
            } catch (e) {
                console.log("Could not get settings");
            }

            console.groupEnd();
        });

        console.groupEnd();
    }

    static addToWebRTCService(webRTCService) {
        // Add a diagnostic method to the WebRTC service
        webRTCService.runDiagnostics = function () {
            console.group("WebRTC Service Diagnostics");

            console.log("Active Room ID:", this.roomId);
            console.log("Broadcaster ID:", this.broadcasterId);
            console.log("Viewer ID:", this.viewerId);

            // Log local streams
            console.group("Local Streams");
            console.log("Camera Stream:", !!this.localStreams.camera);
            if (this.localStreams.camera) {
                WebRTCDiagnostics.logMediaStreamInfo(this.localStreams.camera, "Camera Stream");
            }

            console.log("Screen Stream:", !!this.localStreams.screen);
            if (this.localStreams.screen) {
                WebRTCDiagnostics.logMediaStreamInfo(this.localStreams.screen, "Screen Stream");
            }

            console.log("Merged Stream:", !!this.localStreams.merged);
            if (this.localStreams.merged) {
                WebRTCDiagnostics.logMediaStreamInfo(this.localStreams.merged, "Merged Stream");
            }
            console.groupEnd();

            // Log peer connection info
            console.log("Peer Connection:", !!this.peerConnection);
            if (this.peerConnection) {
                WebRTCDiagnostics.logConnectionStats(this.peerConnection);

                // Log tracks in the connection
                console.group("Peer Connection Tracks");
                const senders = this.peerConnection.getSenders();
                console.log("Senders:", senders.length);
                senders.forEach((sender, i) => {
                    console.log(`Sender ${i + 1} Track:`, sender.track ? sender.track.kind : "none");
                });

                const receivers = this.peerConnection.getReceivers();
                console.log("Receivers:", receivers.length);
                receivers.forEach((receiver, i) => {
                    console.log(`Receiver ${i + 1} Track:`, receiver.track ? receiver.track.kind : "none");
                });
                console.groupEnd();
            }

            console.groupEnd();

            return "Diagnostics logged to console";
        };

        // Hook important methods to add diagnostic logging
        const originalCreatePeerConnection = webRTCService.createPeerConnection;
        webRTCService.createPeerConnection = function () {
            console.log("Creating peer connection");
            const result = originalCreatePeerConnection.apply(this, arguments);
            console.log("Peer connection created");
            return result;
        };

        const originalAddLocalStreamsToPeerConnection = webRTCService.addLocalStreamsToPeerConnection;
        webRTCService.addLocalStreamsToPeerConnection = function () {
            console.log("Adding local streams to peer connection");
            if (this.localStreams.merged) {
                console.log("Using merged stream with tracks:", this.localStreams.merged.getTracks().length);
            } else if (this.localStreams.camera) {
                console.log("Using camera stream with tracks:", this.localStreams.camera.getTracks().length);
            } else if (this.localStreams.screen) {
                console.log("Using screen stream with tracks:", this.localStreams.screen.getTracks().length);
            } else {
                console.log("No streams to add to peer connection");
            }

            const result = originalAddLocalStreamsToPeerConnection.apply(this, arguments);

            // Log the senders after adding tracks
            if (this.peerConnection) {
                const senders = this.peerConnection.getSenders();
                console.log("Peer connection now has senders:", senders.length);
            }

            return result;
        };

        return webRTCService;
    }

    static testIceGathering() {
        console.log("Testing ICE gathering...");

        // Create a test peer connection with Google's STUN server
        const pc = new RTCPeerConnection({
            iceServers: [
                {urls: "stun:stun.l.google.com:19302"}
            ]
        });

        // Add a data channel to trigger ICE gathering
        pc.createDataChannel("test-channel");

        // Set up candidate logging
        let candidateCount = 0;
        pc.addEventListener('icecandidate', event => {
            if (event.candidate) {
                candidateCount++;
                console.log(`ICE candidate ${candidateCount} found:`, event.candidate.candidate);
            } else {
                console.log(`ICE gathering complete. Found ${candidateCount} candidates.`);
                pc.close();
            }
        });

        // Create an offer to start ICE gathering
        pc.createOffer()
            .then(offer => pc.setLocalDescription(offer))
            .then(() => console.log("Local description set, ICE gathering started"))
            .catch(error => console.error("Error in test ICE gathering:", error));

        // Set timeout to check if we get candidates
        setTimeout(() => {
            if (candidateCount === 0) {
                console.error("No ICE candidates found after 5 seconds - possible network/firewall issue");
            }
        }, 5000);

        return "ICE gathering test started. Check console for results.";
    }

    // Add this to your WebRTCService.js file or call it after creating the WebRTCService instance
    static setupDiagnosticLogging() {
        // Test WebRTC capabilities of the browser
        console.group("WebRTC Browser Capability Check");

        console.log("getUserMedia:", !!navigator.mediaDevices?.getUserMedia);
        console.log("getDisplayMedia:", !!navigator.mediaDevices?.getDisplayMedia);
        console.log("RTCPeerConnection:", !!window.RTCPeerConnection);
        console.log("RTCSessionDescription:", !!window.RTCSessionDescription);
        console.log("RTCIceCandidate:", !!window.RTCIceCandidate);

        // Check for WebRTC encryption
        console.log("DTLS Support:", !!RTCRtpSender.getCapabilities?.('video')?.codecs?.some(c => c.sdpFmtpLine?.includes('profile-level-id')));

        // Check firewall status (indirect check)
        if (window.RTCPeerConnection) {
            try {
                const pc = new RTCPeerConnection({iceServers: [{urls: "stun:stun.l.google.com:19302"}]});
                pc.createDataChannel("test");
                pc.onicecandidate = e => {
                    if (e.candidate) {
                        console.log("ICE candidate found - network appears accessible");
                        pc.close();
                    }
                };
                pc.createOffer().then(offer => pc.setLocalDescription(offer));
                setTimeout(() => {
                    if (pc.iceConnectionState === "new") {
                        console.log("No ICE candidates found - possible firewall issue");
                        pc.close();
                    }
                }, 3000);
            } catch (e) {
                console.error("Error testing network connectivity:", e);
            }
        }

        console.groupEnd();
    }
}

export default WebRTCDiagnostics;
