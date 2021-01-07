import React, {Component} from 'react';
import CloseIcon from '@material-ui/icons/Close';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
import MenuItem from "@material-ui/core/MenuItem";
import Create from "@material-ui/icons/Create";

import {updateRallyItem, moveRallyItem, moveRallyHead} from "../redux/entityDataReducer";
import HtmlEditor from "./HtmlEditor";

class AgendaItemForm extends Component {

    constructor(props) {
        super(props);
        this.state = {showing: false}
        this.onChange = this.onChange.bind(this);
        this.onToggle = this.onToggle.bind(this);
    }

    onChangeItem(key, val) {
        if (key === 'nest') {
            this.props.dispatch(moveRallyHead(this.props.index, val));
        } else if (key === 'order') {
            this.props.dispatch(moveRallyItem(this.props.index, val));
        } else {
            let item = JSON.parse(JSON.stringify(this.props.item));
            item[key] = val;
            this.props.dispatch(updateRallyItem(item, this.props.index))
        }
    }

    onChange(event) {
        this.onChangeItem(event.target.name, event.target.value);
    }

    onToggle(e) {
        let obj = {showing: !this.state.showing};
        if (e.currentTarget) {
            obj.anchorEl = e.currentTarget;
        }
        this.setState(obj);
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
                            name="nest"
                            select
                            label='Change Header'
                            fullWidth={true}
                            className={classes.field}
                            value={this.props.item.nest[0]}
                            onChange={this.onChange}
                        >
                            {this.props.headers.map((option, i) => (
                                <MenuItem key={'parents' + i} value={option.label}>
                                    {option.label} <small>({option.count})</small>
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField name="title" label="Title" value={this.props.item.title} fullWidth={true} variant={'standard'} className={classes.field}
                                   onChange={this.onChange} />


                        <div style={{display:'flex', justifyContent:'space-between'}}>
                            <TextField name="order" label="Item Order" type="number"
                                       value={this.props.index + 1}
                                       onChange={this.onChange}
                                       variant={'outlined'}
                                       className={classes.field}
                                       InputLabelProps={{
                                           shrink: true,
                                       }} />
                            <TextField name="seconds" label="Seconds" type="number"
                                       value={this.props.item.seconds}
                                       onChange={this.onChange}
                                       variant={'outlined'}
                                       className={classes.field}
                                       InputLabelProps={{
                                           shrink: true,
                                       }} />
                        </div>

                        <HtmlEditor label={"Content"} onChange={val => this.onChangeItem('html', val)} html={this.props.item.html} multiline rowsMax={4} />

                        <TextField name="outline" label="Outline"
                                   value={JSON.stringify(this.props.item.outline)}
                                   onChange={this.onChange}
                                   variant={'outlined'}
                                   className={classes.field}
                                   fullWidth={true} multiline rowsMax={4}/>


                    </div>
                </Popover>
            </React.Fragment>
        );
    }
}

export default AgendaItemForm;
