import React from 'react';
import PropTypes from 'prop-types';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import TextField from "@material-ui/core/TextField";

class InlineEditable extends React.Component {

    constructor(p) {
        super(p);
        this.state = {editing:p.editing}
    }

    render() {
        // TODO: render the correct field type with validation based on `src/fields/configs/rallies/${this.props.field.field_name}.json`

        return (
            <React.Fragment>
                {this.state.editing === true ?
                    <TextField
                        name={this.props.field.field_name}
                        label={this.props.field.field_label}
                        variant={'outlined'}
                        value={children}
                        onChange={this.onChange}
                    />
                :
                    children
                }
                {this.props.editMode === false
                    ? ''
                    : (this.state.editing === false)
                    ?
                    <IconButton onClick={e => this.setState({editing:true})}><EditIcon /></IconButton>
                    :
                    <IconButton onClick={e => this.setState({editing:false})}><SaveIcon /></IconButton>
                }
            </React.Fragment>
        );
    }
}

InlineEditable.defaultProps = {
    editMode: false
}

InlineEditable.propTypes = {
    children: PropTypes.node,
    field: PropTypes.object.isRequired,
    editMode: PropTypes.bool.isRequired
};

export default InlineEditable;
