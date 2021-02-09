import React, {Component} from 'react';
import Typography from "@material-ui/core/Typography";
import PropTypes from 'prop-types';

class VideoElement extends Component {

    constructor(p) {
        super(p);
        this.listener = false;
        this.vidEl = React.createRef();
        this.state = {mounted:false, showRoomId:false, viewers: this.props.viewers}
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log("actualizado", this.props)

        if(this.props.roomId && !prevProps.roomId) {
            this.listener = true;
            this.props.db.collection('rooms').doc(this.props.roomId).onSnapshot((snap) => {
                    console.log('snap', snap.data())
                this.setState({viewers:snap.data().viewers}) ;
            })

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
        console.log("montado", this.props)

      


        this.setState({mounted:true})
    }



    render() {
        return (
            <React.Fragment>
                <video controls style={{height: 250, width: '100%'}} autoPlay ref={this.vidEl} />
                {(!this.props.roomId) ? '' :
                    <p style={{display:'inline-flex', margin:0}} >
                        {this.props.viewers === -1 ? '' : <span style={{marginRight:5}} >viewers: {this.state.viewers}</span>}
                        <span style={{marginRight:5, fontWeight:'bold'}}>{this.state.showRoomId === true ? this.props.roomId : ' **** '}</span>
                        <u onClick={() => this.setState({showRoomId:!this.state.showRoomId})}>{this.state.showRoomId === true ? 'hide' : 'show'}</u>
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
