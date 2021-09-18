import React, {Component} from 'react';
import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormControl from '@material-ui/core/FormControl';
// import Typography from "@material-ui/core/Typography";
import {registerAccount} from "../redux/authActions";

class SignUpForm extends Component {

    componentDidMount() {
        window.logUse.logEvent('view', {page: 'register'});
    }

    submitForm(e) {
        e.preventDefault();
        var form = e.target;

        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!form['email'].value || !re.test(String(form['email'].value).toLowerCase())) {
            return alert('invalid email');
        }
        if (form['password'].value.length > 0 && form['password'].value.length < 3) {
            return alert('Password must be 4 characters or greater. Leave empty to set a random password.');
        }

        this.props.dispatch(registerAccount(form['email'].value, form['password'].value));
    }

    render() {

        return (
            <div className='SignUpForm'>
                <form onSubmit={(e) => this.submitForm(e)}>
                    <FormGroup>
                        <FormControl>
                            <InputLabel htmlFor='frmEmailA'>Email</InputLabel>
                            <Input
                                id='frmEmailA'
                                name='email'
                                type='email'
                            />
                        </FormControl>
                    </FormGroup>
                    <FormGroup>
                        <FormControl>
                            <InputLabel htmlFor='inp-signup-password'>Optional Password</InputLabel>
                            <Input
                                id='inp-signup-password'
                                name='password'
                                type='password'
                            />
                        </FormControl>
                    </FormGroup>

                    <FormGroup style={{marginTop: 10, flexDirection: 'row'}}>
                        <Button variant="contained" color="primary" type='submit'>
                            Sign Up
                        </Button>
                    </FormGroup>
                </form>
            </div>
        );
    }
}

export default SignUpForm;
