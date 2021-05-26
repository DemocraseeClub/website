import React from 'react';
import './App.css';
import Home from './views/Home';
import About from './views/About';
import Ethics from './views/Ethics';
import Sponsors from './views/Sponsors';
import Rallies from "./views/Rallies";
import {BrowserRouter as Router, NavLink, Route, Switch} from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import FirebaseCMS from "./views/firebaseCMS/FirebaseCMS";
import Topics from "./views/Topics";
import Resources from "./views/Resources";
import RallyHome from "./views/RallyHome";
import MeetingHome from "./views/MeetingHome";
import RallyTemplates from "./views/RallyTemplates";
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import {SnackbarProvider} from "notistack";
import CancelIcon from '@material-ui/icons/Cancel';
import {useSelector} from "react-redux";
import {createMuiTheme, responsiveFontSizes, ThemeProvider} from "@material-ui/core/styles";

import {CMSMainView} from "@camberi/firecms";

const baseTheme = {
    typography: {
        fontFamily: [
            'Roboto',
            'Arial',
            '"Helvetica Neue"',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
            'sans-serif',
        ].join(','),
        button: {textDecoration: 'none'},
        body: {fontSize: '1.75rem'},
        h1: {fontSize: '1.75rem'},
        h2: {fontSize: '1.5rem'},
        h3: {fontSize: '1.25rem'},
        h4: {fontSize: '1rem'},
        h5: {fontSize: '.9rem'},
        h6: {fontSize: '.8rem'},
        useNextVariants: true
    }
}

function App(props) {
    const [isOpen, closeWarning] = React.useState(process.env.NODE_ENV === 'production' && document.location.pathname.indexOf('/rally/') !== 0);
    const auth = useSelector(state => state.auth);

    const notistackRef = React.useRef();
    const onClickDismiss = (key) => {
        notistackRef.current.handleDismissSnack(key);
    }

    let appTheme = createMuiTheme(Object.assign(baseTheme, auth.siteTheme));
    appTheme = responsiveFontSizes(appTheme, {factor: 20});
    if (process.env.NODE_ENV === 'development') {
        console.log(appTheme);
    }

    const cmsParams = {
        primaryColor:appTheme.palette.primary[appTheme.palette.type],
        secondaryColor:appTheme.palette.secondary[appTheme.palette.type],
        name:"Democrasee",
        allowSkipLogin:false
    };

    return (
        <ThemeProvider theme={appTheme}>
            <FirebaseCMS dispatch={props.dispatch} {...cmsParams}>
                <SnackbarProvider maxSnack={3}
                                  ref={notistackRef}
                                  action={(key) => (<CancelIcon onClick={() => onClickDismiss(key)}/>)}>
                    <div className="App" id={appTheme.palette.type === 'dark' ? 'darkMode' : 'lightMode'} style={{backgroundColor:appTheme.palette.background.default}}>
                        <Router>
                            <Dialog open={isOpen}>
                                <div style={{padding: 30}}>
                                    <p style={{textAlign: 'right', marginBottom: 30}}>
                                        <Button color='primary' variant='contained'
                                                onClick={() => closeWarning(false)}>Close</Button>
                                    </p>
                                    <p>This site is just a prototype. If interested please share your ideal <NavLink
                                        onClick={() => closeWarning(false)} to={"/rally/templates"}>meeting
                                        template</NavLink></p>
                                    <p>To subscribe, visit the live site <a href="https://democrasee.club"
                                                                            target="_blank"
                                                                            rel="noopener noreferrer">Democrasee.club</a>.
                                    </p>
                                </div>
                            </Dialog>
                            <Header/>

                            <Switch>
                                <Route path="/cms">
                                    <CMSMainView {...cmsParams} />
                                </Route>
                                <Route path="/login">
                                    <CMSMainView  {...cmsParams} />
                                </Route>
                                <Route path="/c/:entity">
                                    <CMSMainView {...cmsParams} />
                                </Route>

                                <Route path="/rallies">
                                    <Rallies/>
                                    <div style={{display: "none"}}>
                                        <CMSMainView {...cmsParams} />
                                    </div>
                                </Route>

                                <Route path="/values"><Topics/></Route>
                                <Route path="/resources"><Resources/></Route>
                                <Route path="/sponsors"><Sponsors/></Route>

                                <Route exact path="/rally/:rid/meeting/:mid" component={MeetingHome} />
                                <Route exact path="/rally/templates" component={RallyTemplates}/>
                                <Route exact path="/rally/:rid" component={RallyHome}/>
                                <Route exact path="/office-hours/:uid" component={Home}/>
                                <Route exact path="/citizen/:uid" component={Home}/> {/* TODO: create User profile */}
                                <Route exact path="/my-profile" component={Home}/> {/* TODO: same as User profile with Account Edit buttons*/}
                                <Route path="/about"><About/></Route>
                                <Route path="/ethics"><Ethics/></Route>
                                <Route path="/"><Home/></Route>
                            </Switch>

                            <Footer dispatch={props.dispatch}/>
                        </Router>
                    </div>
                </SnackbarProvider>
            </FirebaseCMS>
        </ThemeProvider>
    );
}

export default App;
