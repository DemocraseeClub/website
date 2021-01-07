import React, {Component} from 'react';
import {withStyles} from "@material-ui/core/styles";
import CloseIcon from '@material-ui/icons/Close';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
import Button from "@material-ui/core/Button";
import MenuItem from "@material-ui/core/MenuItem";
import Create from "@material-ui/icons/Create";

class AgendaItemForm extends Component {

    constructor(props) {
        super(props);
        this.state = {showing: false}
        this.onItemSave = this.onItemSave.bind(this);
        this.onChangeHeader = this.onChangeHeader.bind(this);
        this.onToggle = this.onToggle.bind(this);
    }

    onItemSave(e) {

    }

    onToggle(e) {
        let obj = {showing: !this.state.showing};
        if (e.currentTarget) {
            console.log(e.currentTarget)
            obj.anchorEl = e.currentTarget;
        }
        this.setState(obj);
    }


    onChangeHeader(e) {

    }

    render() {
        const {classes} = this.props;
        return (
            <React.Fragment>
                <IconButton size={'small'} variant={'outlined'} onClick={this.onToggle}><Create/></IconButton>
                <Popover
                    open={this.state.showing === true}
                    anchorEl={this.state.anchorEl}
                    onClose={this.onToggle}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                >
                    <div className={classes.popPadding}>
                        <div style={{textAlign: 'right'}}>
                            <IconButton onClick={this.onToggle}><CloseIcon/></IconButton>
                        </div>
                        <TextField
                            id="group-headers"
                            select
                            label='Change Header'
                            fullWidth={true}
                            className={classes.field}
                            value={this.props.item.nest[0]}
                            onChange={this.onChangeHeader}
                        >
                            {this.props.headers.map((option, i) => (
                                <MenuItem key={'parents' + i} value={option.label}>
                                    {option.label} <small>({option.count})</small>
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField id="standard-title" label="Title" value={this.props.item.title} fullWidth={true} variant={'standard'} className={classes.field} />


                        <div style={{display:'flex', justifyContent:'space-between'}}>
                            <TextField id="standard-order" label="Item Order" type="number"
                                       value={this.props.index + 1}
                                       variant={'outlined'}
                                       className={classes.field}
                                       InputLabelProps={{
                                           shrink: true,
                                       }}/>
                            <TextField id="standard-seconds" label="Seconds" type="number"
                                       value={this.props.item.seconds}
                                       variant={'outlined'}
                                       className={classes.field}
                                       InputLabelProps={{
                                           shrink: true,
                                       }}/>
                        </div>

                        <TextField id="standard-html" label="HTML" value={this.props.item.html} fullWidth={true}
                                   variant={'outlined'}
                                   className={classes.field}
                                   multiline rowsMax={4}/>
                        <TextField id="standard-outline" label="Outline" value={JSON.stringify(this.props.item.outline)}
                                   variant={'outlined'}
                                   className={classes.field}
                                   fullWidth={true} multiline rowsMax={4}/>


                    </div>
                </Popover>
            </React.Fragment>
        );
    }
}


const styles = theme => ({});


export default withStyles(styles)(AgendaItemForm);
