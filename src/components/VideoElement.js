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
        if (prevState.mounted === false && this.state.mounted === true) {
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
            <div>
                <video controls style={{height: 250, width: '100%'}} autoPlay ref={this.vidEl} />
                {(!this.props.roomId) ? '' :
                    <Typography variant='overline' >
                        {this.state.showRoomId === true ? this.props.roomId : '****'}
                        <span onClick={() => this.setState({showRoomId:!this.state.showRoomId})}>{this.state.showRoomId === true ? ' hide' : ' show'}</span>
                    </Typography>
                }
            </div>
        );
    }
}

VideoElement.defaultProps = {
    stream : new MediaStream(),
    roomId : false
}

VideoElement.propTypes = {
    stream: PropTypes.object.isRequired,
    roomId : PropTypes.string.isRequired
};


export default VideoElement;
