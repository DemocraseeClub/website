import React, {Component} from 'react';
import CloseIcon from '@material-ui/icons/Close';
import Create from '@material-ui/icons/Create';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
import Typography from "@material-ui/core/Typography";


class AgendaHeader extends Component {

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
                <div className={classes.stepSection}>
                    <Typography variant='h3' className={classes.topLevelLabel}>
                        {this.props.header.label}
                        <IconButton size={'small'} variant={'outlined'} onClick={this.onShow}><Create/></IconButton>
                    </Typography>
                </div>
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

                        <TextField id="standard-nest" label="Rename Header" value={this.props.header.label} fullWidth={true} />

                        <TextField id="standard-order" label="Change Order" type="number"
                                   value={this.props.header.order + 1}
                                   InputLabelProps={{
                                       shrink: true,
                                   }}/>
                    </div>
                </Popover>
            </React.Fragment>
        );
    }
}

export default AgendaHeader;
