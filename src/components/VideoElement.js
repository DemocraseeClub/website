import React, {Component} from 'react';
import Typography from "@material-ui/core/Typography";

class VideoElement extends Component {

    constructor(p) {
        super(p);
        this.vidEl = React.createRef();
        this.state = {mounted:false}
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
                <Typography variant='caption' component={'span'} >{this.props.roomId}</Typography>
                <video controls style={{height: 250, width: '100%'}} autoPlay ref={this.vidEl} />
            </div>
        );
    }
}

export default VideoElement;
