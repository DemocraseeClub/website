import React, {Component} from 'react';
import CloseIcon from '@material-ui/icons/Close';
import SettingsIcon from '@material-ui/icons/Settings';
import ExportIcon from '@material-ui/icons/ImportExport';
import ApplyIcon from '@material-ui/icons/RecordVoiceOver';

import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';

// import Typography from "@material-ui/core/Typography";

class RallyActions extends Component {

    constructor(props) {
        super(props);
        this.state = {showing: false}
        this.onChangeHeader = this.onChangeHeader.bind(this);
        this.onShow = this.onShow.bind(this);
        this.onClose = this.onClose.bind(this);
    }

    onChangeHeader(e) {

    }

    onShow(e) {
        let obj = {showing: !this.state.showing};
        obj.anchorEl = e.currentTarget;
        this.setState(obj);
    }

    onClose(e) {
        this.setState({showing: false})
    }

    render() {
        const {classes} = this.props;

        return (
            <React.Fragment>
                <IconButton size={'small'} variant={'outlined'} onClick={this.onShow}><SettingsIcon/></IconButton>
                <Popover
                    open={this.state.showing === true}
                    anchorEl={this.state.anchorEl}
                    onClose={this.onClose}
                    anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                    transformOrigin={{vertical: 'bottom', horizontal: 'center'}}
                >
                    <div className={classes.popPadding}>
                        <div style={{textAlign:'right'}} >
                            <IconButton onClick={this.onClose}><CloseIcon/></IconButton>
                        </div>
                        <Button startIcon={<ExportIcon />} fullWidth={true} variant={'contained'} >Edit Meeting</Button>
                        <Button startIcon={<ApplyIcon />} fullWidth={true} variant={'contained'} >Apply to Speak</Button>

                    </div>
                </Popover>
            </React.Fragment>
        );
    }
}

export default RallyActions;
