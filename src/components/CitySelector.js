import React from 'react';
import {fade, withStyles} from '@material-ui/core/styles';
import SearchIcon from "@material-ui/icons/Search";
import InputBase from "@material-ui/core/InputBase";

class CitySelector extends React.Component {
    constructor(p) {
        super(p);
        this.state = {q:'', city:{name:'', id:-1}};
        this.search = this.search.bind(this);
        this.onBlur = this.onBlur.bind(this);
    }

    search(e) {
        this.setState({q:e.currentTarget.value})
        // {{host}}/?rest_route=/wp/v2/demo_cities&search=Albany
    }

    onBlur(e) {
        this.setState({q:this.state.city.name})
    }

    onSelect(city) {
        this.setState({city: city});
        // dispatch new City ID
    }

    render() {
        const {classes} = this.props;
        return (
            <div className={classes.search}>
                <div className={classes.searchIcon}>
                    <SearchIcon color={'secondary'}/>
                </div>
                <InputBase
                    onBlur={e => this.onBlur(e)}
                    onChange={e => this.search(e)}
                    value={this.state.q}
                    placeholder="Select your city"
                    classes={{
                        root: classes.inputRoot,
                        input: classes.inputInput,
                    }}
                    inputProps={{'aria-label': 'search'}}
                />
            </div>
        );
    }

}


const useStyles = theme => ({
    search: {
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: fade(theme.palette.common.white, 0.25),
        },
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing(1),
            width: 'auto',
        },
    },
    searchIcon: {
        padding: theme.spacing(0, 2),
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputRoot: {
        color: '#002866',
    },
    inputInput: {
        padding: theme.spacing(.75, .5, .75, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(.75em + ${theme.spacing(4)}px)`,
        paddingRight: `calc(${theme.spacing(2)}px)`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: '13ch',
            '&:focus': {
                width: '25ch',
            },
        }
    }
});

export default withStyles(useStyles, {withTheme:true})(CitySelector);
