import React, {Component} from 'react';
import PropTypes from 'prop-types';

class VideoElement extends Component {

    constructor(p) {
        super(p);
        this.listener = false;
        this.vidEl = React.createRef();
        this.state = {mounted:false, viewers: this.props.viewers, listener: null}
    }

    componentDidUpdate(prevProps, prevState, snapshot) {

        if(prevProps.viewers !== this.props.viewers) {
            this.setState({viewers: this.props.viewers})
        }

        if(this.props.roomId && !prevProps.roomId) {
            this.listener = true;
            const auxListener = window.fireDB.collection('rooms').doc(this.props.roomId).onSnapshot((snap) => {
                console.log(snap.data(), 'snap')
                if(snap.data())
                    this.setState({viewers:snap.data().viewers}) ;
            })

            this.setState({listener:auxListener})
        }

        if (this.props.stream) {
            let doUpdate = prevState.mounted === false && this.state.mounted === true; // first time
            if (doUpdate === false) {
                if (this.props.stream.id !== prevProps.stream.id || this.props.roomId !== prevProps.roomId) {
                    doUpdate = true;
                }
            }
            if (doUpdate === true ) {
                this.vidEl.current.srcObject = this.props.stream;
                console.log(this.vidEl.current.srcObject)
                if (this.props.muted === true) {
                    this.vidEl.current.volume = 0;
                }

            }
        }
    }

    componentDidMount() {
        this.setState({mounted:true})
    }

    componentWillUnmount() {
        if(this.state.listener) this.state.listener();
    }

    render() {
        return (
            <video controls style={{height: 250, width: '100%'}} autoPlay ref={this.vidEl} />
        );
    }
}

VideoElement.defaultProps = {
    stream : new MediaStream(),
    roomId : '',
    viewers : -1,
    muted : false,
}

VideoElement.propTypes = {
    stream: PropTypes.object.isRequired,
    roomId : PropTypes.string,
    viewers : PropTypes.number,
    muted : PropTypes.bool
};


export default VideoElement;
