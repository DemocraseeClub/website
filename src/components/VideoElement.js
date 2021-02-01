import React, {Component} from 'react';
import Typography from "@material-ui/core/Typography";
import PropTypes from 'prop-types';

class VideoElement extends Component {

    constructor(p) {
        super(p);
        this.vidEl = React.createRef();
        this.state = {mounted:false, showRoomId:false}
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

    componentDidMount() {
        this.setState({mounted:true})
    }

    render() {
        return (
            <React.Fragment>
                <video controls style={{height: 250, width: '100%'}} autoPlay ref={this.vidEl} />
                {(!this.props.roomId) ? '' :
                    <Typography variant='overline' style={{display:'inline-flex'}} >
                        {this.props.viewers === -1 ? '' : <span style={{marginRight:5}} >viewers: {this.props.viewers}</span>}
                        <span style={{marginRight:5}}>{this.state.showRoomId === true ? this.props.roomId : ' **** '}</span>
                        <u onClick={() => this.setState({showRoomId:!this.state.showRoomId})}>{this.state.showRoomId === true ? 'hide' : 'show'}</u>
                    </Typography>
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
