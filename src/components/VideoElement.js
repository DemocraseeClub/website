import React, {Component} from 'react';
import PropTypes from 'prop-types';
import WebRTCDiagnostics from "../redux/WebRTCDiagnostics";

class VideoElement extends Component {
    constructor(props) {
        super(props);
        this.vidEl = React.createRef();
        this.state = {
            mounted: false,
            viewers: this.props.viewers,
            listener: null,
            streamAttached: false
        };
    }


    componentDidMount() {
        this.setState({mounted: true});

        // Attempt to set stream immediately if available
        this.updateVideoStream({});
    }

    componentWillUnmount() {
        // Clean up Firebase listener if it exists
        if (this.state.listener) {
            this.state.listener();
        }

        // Clean up video element
        if (this.vidEl.current) {
            this.vidEl.current.srcObject = null;
        }
    }

    componentDidUpdate(prevProps, prevState) {
        // Update viewer count if changed
        if (prevProps.viewers !== this.props.viewers) {
            this.setState({viewers: this.props.viewers});
        }

        // Set up Firebase listener if roomId is provided
        if (this.props.roomId && !prevState.listener) {
            console.log(`Setting up Firebase listener for room ${this.props.roomId}`);
            const auxListener = window.fireDB.collection('rooms').doc(this.props.roomId).onSnapshot((snap) => {
                if (snap.exists && snap.data()) {
                    this.setState({viewers: snap.data().viewers || 0});
                    console.log(`Updated viewer count for room ${this.props.roomId}:`, snap.data().viewers);
                }
            });
            this.setState({listener: auxListener});
        }

        if (prevProps.stream !== this.props.stream) {
            console.log("Stream changed in VideoElement");
            if (this.props.stream) {
                WebRTCDiagnostics.logMediaStreamInfo(this.props.stream, "Video Element New Stream");
            }
        }

        // Handle stream updates - improved logic
        this.updateVideoStream(prevProps);
    }

    updateVideoStream(prevProps) {
        if (!this.vidEl.current) return;

        // Check if we have a stream to attach
        if (this.props.stream) {
            const hasVideoTracks = this.props.stream.getVideoTracks().length > 0;
            const hasAudioTracks = this.props.stream.getAudioTracks().length > 0;

            console.log('Stream track status:', {
                streamId: this.props.stream.id,
                videoTracks: hasVideoTracks ? this.props.stream.getVideoTracks().length : 0,
                audioTracks: hasAudioTracks ? this.props.stream.getAudioTracks().length : 0,
                currentlyAttached: this.vidEl.current.srcObject === this.props.stream
            });

            // Determine if we need to update
            const needsUpdate =
                // First time setting stream or different stream
                !this.vidEl.current.srcObject ||
                this.vidEl.current.srcObject !== this.props.stream ||
                // Stream changed since last render
                (prevProps && prevProps.stream !== this.props.stream);

            if (needsUpdate) {
                console.log('Updating video element with stream:', this.props.stream.id);

                // Set the stream
                this.vidEl.current.srcObject = this.props.stream;

                // Ensure autoplay works
                if (this.vidEl.current.paused) {
                    this.vidEl.current.play().catch(err => {
                        console.warn('Autoplay failed:', err);

                        // Create a play button if autoplay fails
                        if (!this.playButtonCreated && (hasVideoTracks || hasAudioTracks)) {
                            this.createPlayButton();
                        }
                    });
                }

                // Set muted property directly
                this.vidEl.current.muted = !!this.props.muted;

                // Monitor for track ended events
                this.props.stream.getTracks().forEach(track => {
                    track.addEventListener('ended', () => {
                        console.log(`Track ended in video element: ${track.kind}`);
                    });
                });
            }
        } else if (this.vidEl.current.srcObject) {
            // Clear the video if we no longer have a stream
            console.log('Clearing video element stream');
            this.vidEl.current.srcObject = null;
        } else {
            console.log('Missing Stream!', this.props);
        }
    }

    createPlayButton() {
        const videoContainer = this.vidEl.current.parentElement;
        if (!videoContainer) return;

        // Create a play button overlay
        const playButton = document.createElement('button');
        playButton.textContent = 'Play Video';
        playButton.style.position = 'absolute';
        playButton.style.top = '50%';
        playButton.style.left = '50%';
        playButton.style.transform = 'translate(-50%, -50%)';
        playButton.style.zIndex = '10';
        playButton.style.padding = '10px 20px';
        playButton.style.backgroundColor = '#007bff';
        playButton.style.color = 'white';
        playButton.style.border = 'none';
        playButton.style.borderRadius = '5px';
        playButton.style.cursor = 'pointer';

        // Add click handler
        playButton.addEventListener('click', () => {
            this.vidEl.current.play();
            playButton.remove();
        });

        videoContainer.style.position = 'relative';
        videoContainer.appendChild(playButton);

        this.playButtonCreated = true;
    }

    render() {
        // Add debugging info
        console.log('VideoElement render, has stream:', !!this.props.stream,
            'stream ID:', this.props.stream?.id,
            'video tracks:', this.props.stream?.getVideoTracks()?.length,
            'audio tracks:', this.props.stream?.getAudioTracks()?.length);

        return (
            <div style={{position: 'relative'}}>
                <video
                    controls
                    style={{height: 250, width: '100%'}}
                    autoPlay
                    ref={this.vidEl}
                    playsInline // Add playsInline for mobile support
                    muted={this.props.muted}
                />
                {this.props.viewers > 0 && (
                    <div style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        background: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: 4,
                        fontSize: 12
                    }}>
                        {this.props.viewers} viewer{this.props.viewers !== 1 ? 's' : ''}
                    </div>
                )}
            </div>
        );
    }
}

VideoElement.defaultProps = {
    stream: new MediaStream(),
    roomId: '',
    viewers: -1,
    muted: false,
};

VideoElement.propTypes = {
    stream: PropTypes.object.isRequired,
    roomId: PropTypes.string,
    viewers: PropTypes.number,
    muted: PropTypes.bool
};

export default VideoElement;
