import React, {Component} from 'react';

import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormControl from '@material-ui/core/FormControl';
// import Typography from "@material-ui/core/Typography";
import {getToken} from "../redux/authActions";

class SignInForm extends Component {

    constructor(props) {
        super(props);
        this.state = {email: '', pass: ''};
    }

    componentDidMount() {
        window.logUse.logEvent('view', {page: 'login'});
    }

    forgotPassword(e) {
        e.preventDefault();
        window.logUse.logEvent('view', {page: 'forgotpassword'});
        // this.props.dispatch(loadPasswordReminder(this.state.email));
        return false;
    }

    submitForm(e) {
        e.preventDefault();

        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!this.state.email || !re.test(String(this.state.email).toLowerCase())) {
            return alert('invalid email');
        }
        if (!this.state.pass || this.state.pass.length < 3) {
            return alert('invalid password');
        }
        this.props.dispatch(getToken(this.state.email, this.state.pass));
        return false;
    }

    render() {
        return (
            <div className='SignInForm'>
                <form action="/auth" method="POST" name="login-form">
                    {(document.location.pathname.indexOf('/otp/') === 0) ?
                        <p>Verifying your login code</p> :
                        <div>
                            <FormGroup key='email'>
                                <FormControl component='div'>
                                    <InputLabel htmlFor='inp-login-email'>Email</InputLabel>
                                    <Input
                                        onChange={e => this.setState({email: e.currentTarget.value})}
                                        value={this.state.email}
                                        id='inp-login-email'
                                        name='email'
                                        type='email'
                                    />
                                </FormControl>
                            </FormGroup>
                            <FormGroup key='password'>
                                <FormControl component='div'>
                                    <InputLabel htmlFor='inp-login-password'>Password</InputLabel>
                                    <Input
                                        onChange={e => this.setState({pass: e.currentTarget.value})}
                                        value={this.state.pass}
                                        id='inp-login-password'
                                        name='password'
                                        type='password'
                                    />
                                </FormControl>
                            </FormGroup>
                            <FormGroup style={{marginTop: 25, flexDirection: 'row', alignItems: 'center'}}>
                                <Button aria-label='Login Button' variant="contained" color="primary"
                                        onClick={e => this.submitForm(e)}>Sign In</Button>
                                <span style={{flexGrow: 1}}>&nbsp;</span>
                                <Button onClick={e => this.forgotPassword(e)}> Forgot Password</Button>
                            </FormGroup>
                        </div>
                    }
                </form>
            </div>
        );
    }
}

export default SignInForm;
