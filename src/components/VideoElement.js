import React, {Component} from 'react';
import PropTypes from 'prop-types';

class VideoElement extends Component {

    constructor(p) {
        super(p);
        this.listener = false;
        this.vidEl = React.createRef();
        this.state = {mounted:false, showRoomId:false, listener: null}
    }

    componentDidMount() {
        this.setState({mounted:true})
    }

    componentDidUpdate(prevProps, prevState, snapshot) {

        let doUpdate = prevState.mounted === false && this.state.mounted === true;
        if (doUpdate === false) {
            if (this.props.stream.id !== prevProps.stream.id || this.props.roomId !== prevProps.roomId) {
                doUpdate = true;
            }
        }
        if (doUpdate === true ) {
            this.vidEl.current.srcObject = this.props.stream;
            if (this.props.muted === true) {
                this.vidEl.current.volume = 0;
            }
        }
    }

    render() {
        if (!this.props.stream) return <div>avatar</div>
        return (
            <video controls style={{height: 250, width: '100%'}} autoPlay ref={this.vidEl} />
        );
    }
}

VideoElement.defaultProps = {
    stream : new MediaStream(),
    roomId : false,
    muted : false,
}

VideoElement.propTypes = {
    stream: PropTypes.object.isRequired,
    roomId : PropTypes.string,
    muted : PropTypes.bool
};


export default VideoElement;
