import React, {Component} from 'react';
import CloseIcon from '@material-ui/icons/Close';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
import Create from "@material-ui/icons/Create";
import Delete from "@material-ui/icons/Delete";
import FileCopy from "@material-ui/icons/FileCopy";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';

import {updateRallyItem, moveRallyItem, initCounter} from "../redux/entityDataReducer";
import HtmlEditor from "./HtmlEditor";

class AgendaItemForm extends Component {

    constructor(props) {
        super(props);
        this.state = {showing: false}
        this.onChange = this.onChange.bind(this);
        this.onToggle = this.onToggle.bind(this);
    }

    onChangeItem(key, val) {
        if (key === 'delete' || key === 'clone') {
            this.props.dispatch(updateRallyItem(key, val, this.props.index));
        } else if (key === 'order') {
            this.props.dispatch(moveRallyItem(this.props.index, parseInt(val)));
        } else {
            if (typeof this.props.item[key] === 'object' && this.props.item[key] !== null) {
                try {
                    if (val.length > 0) {
                        val = JSON.parse(val);
                    }
                } catch (e) {
                    return;
                }
            } else if (typeof this.props.item[key] === 'number') {
                val = parseInt(val);
            }
            if (val !== this.props.item[key]) {
                this.props.dispatch(updateRallyItem(key, val, this.props.index))
                if (key === 'seconds' || key === 'nest') {
                    this.props.dispatch(initCounter());
                }
            }
        }
    }

    onChange(event) {
        this.onChangeItem(event.target.name, event.target.value);
    }

    onToggle(e) {
        let obj = {showing: !this.state.showing};
        if (e && e.currentTarget) {
            obj.anchorEl = e.currentTarget;
        }
        this.setState(obj);
    }

    render() {
        const {classes} = this.props;
        return (
            <React.Fragment>
                <Grid container alignItems="center" justify={'flex-end'} >
                    <IconButton onClick={e => this.onChangeItem('order', this.props.index - 1)} ><ExpandLess/></IconButton>
                    <IconButton onClick={e => this.onChangeItem('order', this.props.index + 1)} ><ExpandMore/></IconButton>
                    <Divider orientation="vertical" flexItem variant={'middle'}  />
                    <IconButton onClick={this.onToggle}><Create/></IconButton>
                    <IconButton onClick={e => this.onChangeItem('clone')} ><FileCopy /></IconButton>
                    <Divider orientation="vertical" flexItem variant={'middle'} />
                    <IconButton onClick={e => this.onChangeItem('delete')} ><Delete /></IconButton>
                </Grid>
                <Popover
                    open={this.state.showing === true}
                    anchorEl={this.state.anchorEl}
                    onClose={this.onToggle}
                    anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                    transformOrigin={{vertical: 'bottom', horizontal: 'center'}}
                >
                    <div className={classes.popPadding}>
                        <div style={{textAlign: 'right'}}>
                            <IconButton color={'primary'} size={'small'} onClick={this.onToggle}><CloseIcon/></IconButton>
                        </div>
                        <TextField
                            name="nest"
                            label='Header'
                            fullWidth={true}
                            variant={'outlined'}
                            className={classes.field}
                            value={this.props.item.nest}
                            onChange={this.onChange}
                        />

                        <TextField name="title" label="Title" value={this.props.item.title} fullWidth={true} variant={'standard'} className={classes.field}
                                   variant={'outlined'}
                                   onChange={this.onChange} />

                        <TextField name="seconds" label="Seconds" type="number"
                                   value={this.props.item.seconds}
                                   onChange={this.onChange}
                                   variant={'outlined'}
                                   fullWidth={true}
                                   className={classes.field}
                                   InputLabelProps={{
                                       shrink: true,
                                   }} />

                        <HtmlEditor label={"Content"}
                                    onChange={val => this.onChangeItem('html', val)} html={this.props.item.html} multiline rowsMax={4}
                                    helperText={"Accepts limited HTML"}
                                    />

                        <TextField name="outline" label="Outline"
                                   helperText={'Accepts JSON of strings and arrays.'}
                                   value={JSON.stringify(this.props.item.outline)}
                                   onChange={this.onChange}
                                   variant={'outlined'}
                                   style={{marginTop:20}}
                                   className={classes.field}
                                   fullWidth={true} multiline rowsMax={4}/>


                    </div>
                </Popover>
            </React.Fragment>
        );
    }
}

export default AgendaItemForm;
