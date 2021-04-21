import React from 'react';
import SearchIcon from "@material-ui/icons/Search";
import Input from "@material-ui/core/Input";
import {withSnackbar} from 'notistack';

class CitySelector extends React.Component {
    constructor(p) {
        super(p);
        this.state = {q:''};
        this.search = this.search.bind(this);
    }

    search(e) {
        if (this.state.q === '') {
            this.props.enqueueSnackbar('City search still in development');
        }
        this.setState({q:e.currentTarget.value})
        // {{host}}/?rest_route=/wp/v2/demo_cities&search=Albany
    }

    render() {
        return (
                <Input
                    variant={"filled"}
                    onChange={e => this.search(e)}
                    value={this.state.q}
                    placeholder="Select your city or town"
                    startAdornment={<SearchIcon color={'primary'}/>}
                    inputProps={{'aria-label': 'search'}}
                />
        );
    }

}

export default withSnackbar(CitySelector);
