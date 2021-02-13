import React, {Component} from 'react';
import PropTypes from 'prop-types';

class VideoElement extends Component {

    constructor(p) {
        super(p);
        this.listener = false;
        this.vidEl = React.createRef();
        this.state = {mounted:false, showRoomId:false, viewers: this.props.viewers, listener: null}
    }

    componentDidUpdate(prevProps, prevState, snapshot) {

        if(prevProps.viewers !== this.props.viewers) {
            this.setState({viewers: this.props.viewers})
        }

        if(this.props.roomId && !prevProps.roomId) {
            this.listener = true;
            const auxListener = this.props.db.collection('rooms').doc(this.props.roomId).onSnapshot((snap) => {
                console.log(snap.data(), 'snap')
                this.setState({viewers:snap.data().viewers}) ;
            })

            this.setState({listener:auxListener})
        }

        let doUpdate = prevState.mounted === false && this.state.mounted === true;
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

    componentDidMount() { 
        this.setState({mounted:true})
    }

    componentWillUnmount() {
        if(this.state.listener) this.state.listener();
    }


    render() {
        return (
            <React.Fragment>
                <video controls style={{height: 250, width: '100%'}} autoPlay ref={this.vidEl} />
                {(!this.props.roomId) ? '' :
                    <p style={{display:'inline-flex', margin:0}} >
                        {this.props.viewers === -1 ? '' : <span style={{marginRight:5}} >viewers: {this.state.viewers}</span>}
                        { this.props.notShowCode ? null :
                        <div>
                            <span style={{marginRight:5, fontWeight:'bold'}}>{this.state.showRoomId === true ? this.props.roomId : ' **** '}</span>
                            <u onClick={() => this.setState({showRoomId:!this.state.showRoomId})}>{this.state.showRoomId === true ? 'hide' : 'show'}</u>
                        </div>
                        }
                    </p>
                }
            </React.Fragment>
        );
    }
}

VideoElement.defaultProps = {
    stream : new MediaStream(),
    roomId : false,
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
