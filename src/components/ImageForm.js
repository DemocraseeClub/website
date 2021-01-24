import React, {Component} from 'react';
import InsertPhoto from '@material-ui/icons/InsertPhoto';
import VideoCall from '@material-ui/icons/VideoCall';
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
// import editorStyles from '../theme/editorStyles.module.css';
import Popover from "@material-ui/core/Popover";

export default class ImageAdd extends Component {

    constructor(props) {
        super(props);
        this.state = {showing: false, url: ''}
        this.changeUrl = this.changeUrl.bind(this);
        this.onToggle = this.onToggle.bind(this);
    }

    addImage = () => {
        if (this.props.type === 'image') {
            this.props.onChange(this.props.modifier(this.props.editorState, this.state.url));
        } else {
            // TODO: restrict domains?
            this.props.onChange(this.props.modifier(this.props.editorState, { src : this.state.url}));
        }
    };

    changeUrl = (evt) => {
        this.setState({url: evt.target.value});
    };

    onToggle(e) {
        let obj = {showing: !this.state.showing};
        if (e.currentTarget) {
            obj.anchorEl = e.currentTarget;
        }
        this.setState(obj);
    }

    render() {
        // const {DropArea} = this.props;
        return (
            <React.Fragment>
                <div className={'bi09khh'}>
                    <button type='button' className={'bc4rxid'}>
                        {this.props.type === 'image' ?
                            <InsertPhoto
                                onClick={this.onToggle}
                            />
                            :
                            <VideoCall
                                onClick={this.onToggle}
                            />
                        }
                    </button>
                </div>
                <Popover
                    anchorOrigin={{vertical: 'center', horizontal: 'center'}}
                    transformOrigin={{vertical: 'top', horizontal: 'right'}}
                    open={this.state.showing === true}
                    anchorEl={this.state.anchorEl}
                    onClose={this.onToggle}
                >
                    <div style={{padding:5, flex: 1, alignContent: 'center'}}>
                        <TextField name="imageurl"
                                   label={this.props.type === 'image' ? "Image url …" : "Video url …"}
                                   placeholder={"https://"}
                                   value={this.state.url}
                                   onChange={this.changeUrl}
                        />
                        <Button disabled={this.state.url === ''} onClick={e => this.addImage()}>Add</Button>
                    </div>
                </Popover>
            </React.Fragment>
        );
    }
}
