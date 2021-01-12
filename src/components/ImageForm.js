import React, {Component} from 'react';
import InsertPhoto from '@material-ui/icons/InsertPhoto';
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
        this.props.onChange(this.props.modifier(this.props.editorState, this.state.url));
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
                        <InsertPhoto
                            onClick={this.onToggle}
                        />
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
                        <div style={{width:'100%', height:'200px', backgroundColor:'#ccc'}}> </div>
                        <TextField name="imageurl" label="Web URL"
                                   placeholder="Paste the image or video url …"
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
