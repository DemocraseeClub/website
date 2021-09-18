import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import SignInForm from '../components/SignInForm';
import SignUpForm from '../components/SignUpForm';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
// import OverlayLoader from '../../components/OverlayLoader';

import {withStyles} from '@material-ui/core/styles';

class SignIn extends Component {

    constructor(props) {
        super(props);
        this.state = { tabIndex: this.props.tabIndex || 0 };
    }

    componentDidMount() {
        if (this.props.location.pathname === '/signup') {
            this.setState({tabIndex:1});
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.auth.me && this.props.auth.me.profile) {
            this.props.history.push('/');
        } else if (prevProps.location.pathname !== '/signup' && this.props.location.pathname === '/signup' && this.state.tabIndex !== 1) {
            this.setState({tabIndex:1});
        } else if (prevProps.location.pathname !== '/signin' && this.props.location.pathname === '/signin' && this.state.tabIndex !== 0) {
            this.setState({tabIndex:0});
        }
    }

    render() {
        var content = "";
        if (this.state.tabIndex === 0) {
            content = <SignInForm auth={this.props.auth} dispatch={this.props.dispatch} />;
        } else if (this.state.tabIndex === 1) {
            content = <SignUpForm auth={this.props.auth} dispatch={this.props.dispatch} />;
        }

        return(
            <div style={{padding:'3%'}}>
                <Tabs
                    className={this.props.classes.tabs}
                    value={this.state.tabIndex}
                    variant="fullWidth"
                    centered={true}
                    indicatorColor="primary"
                    textColor="inherit" >
                    <Tab label="Sign In" onClick={(e) => this.setState({tabIndex:0})} className={this.props.classes.tabBtn} />
                    <Tab label="Sign Up" onClick={(e) => this.setState({tabIndex:1})} className={this.props.classes.tabBtn} />
                </Tabs>
                <div className={this.props.innerContainer}>
                    {content}
                </div>
            </div>
        );

    }
}

const styles = theme => ({
    innerContainer:{
        position:'relative',
        padding:10,
        width:'100%',
        margin:'10px auto'
    },
    tabs : {
        backgroundColor:theme.palette.background.paper,
    },
    tabBtn : {
        backgroundColor:theme.palette.background.paper,
        color:theme.palette.action.active,
    }
});


const mapStateToProps = (state) => {
    return {
        auth : state.auth
    };
};

export default connect(mapStateToProps, null)(withRouter(withStyles(styles)(SignIn)));
