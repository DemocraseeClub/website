import React from "react";
import "./App.css";
import "./theme/PolinaStyles.css";
import Home from "./views/Home";
import About from "./views/About";
import Ethics from "./views/Ethics";
import Sponsors from "./views/Sponsors";
import SignIn from "./views/SignIn";
import Dashboard from "./views/Dashboard";
import FormWrapper from "./views/FormWrapper";
import {BrowserRouter as Router, NavLink, Route, Switch,} from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MemberList from "./views/MemberList";
import RallyTemplates from "./views/RallyTemplates";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import {SnackbarProvider} from "notistack";
import CancelIcon from "@material-ui/icons/Cancel";
import {useSelector} from "react-redux";
import {createMuiTheme, responsiveFontSizes, ThemeProvider,} from "@material-ui/core/styles";

import {UserContextProvider} from "./contexts/userContext"
import MeetingTemplate from "./views/MeetingTemplate";
import EntityView from "./views/EntityView";

const VIEW_ROUTES = {
    'cities': {
        'list': '/cities',
        'id': '/cities/{city}',
        'rallies': '/cities/{city}/rallies',
        'publications': '/cities/{city}/publications',
        'plans': '/cities/{city}/plans',
        'resources': '/cities/{city}/resources',
        'meetings': '/cities/{city}/meetings',
        'members': '/cities/{city}/members'
    },
    'resources': {
        'list': '/resources',
        'id': '/resources/{resource}'
    },
    'rallies': {
        'list': '/rallies',
        'id': '/rallies/{rally}',
        'publications': '/rallies/{rally}/publications',
        'members': '/rallies/{rally}/members'
    },
    'plans': {
        'list': '/rallies/{rally}/plans',
        'id': '/rallies/{rally}/plans/{plan}',
        'members': '/rallies/{rally}/plans/{plan}/members',
    },
    'meetings': {
        'list': '/rallies/{rally}/meetings',
        'id': '/rallies/{rally}/meetings/{meeting}',
        'members': '/rallies/{rally}/meetings/{meeting}/members',
    },
    'rooms': {
        'list': '/meetings/{meeting}/rooms',
        'id': '/meetings/{meeting}/rooms/{id}',
        'members': '/meetings/{meeting}/members/'
    }
}

const FORM_ROUTES = {
    "group": {
        "cities": {
            "add": "/cities/add",
            "delete": "/cities/{group}/delete",
            "edit": "/cities/{group}/edit"
        },
        "rallies": {"add": "/rallies/add", "delete": "/rallies/{group}/delete", "edit": "/rallies/{group}/edit"},
        "meetings": {"add": "/meetings/add", "delete": "/meetings/{group}/delete", "edit": "/meetings/{group}/edit"},
        "rooms": {"add": "/rooms/add", "delete": "/rooms/{group}/delete", "edit": "/rooms/{group}/edit"},
        "plans": {"add": "/plans/add", "delete": "/plans/{group}/delete", "edit": "/plans/{group}/edit"},
        "resources": {"add": "/resources/add", "delete": "/resources/{group}/delete", "edit": "/resources/{group}/edit"}
    },
    "user": {"account": {"add": "/users/add", "delete": "/users/{user}/delete", "edit": "/users/{user}/edit"}},
    "node": {
        "publication": {
            "add": "/publications/add",
            "edit": "/publications/{node}/edit",
            "delete": "/publications/{node}/delete"
        }
    },
    "group_content": {
        "members": {
            "join": "/group/{group}/members/add",
            "leave": "/group/{group}/members/{group_content}/delete",
            "edit": "/group/{group}/members/{group_content}/edit"
        }
    }
};

const baseTheme = {
    typography: {
        fontFamily: [
            "Roboto",
            "Arial",
            '"Helvetica Neue"',
            "-apple-system",
            "BlinkMacSystemFont",
            '"Segoe UI"',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
            "sans-serif",
        ].join(","),
        button: {textDecoration: "none"},
        body: {fontSize: "1.75rem"},
        h1: {fontSize: "1.75rem"},
        h2: {fontSize: "1.5rem"},
        h3: {fontSize: "1.25rem"},
        h4: {fontSize: "1rem"},
        h5: {fontSize: ".9rem"},
        h6: {fontSize: ".8rem"}
    },
};

function App(props) {
    const [isOpen, closeWarning] = React.useState(
        process.env.NODE_ENV === "production"
    );
    const auth = useSelector((state) => state.auth);

    const notistackRef = React.useRef();
    const onClickDismiss = (key) => {
        notistackRef.current.handleDismissSnack(key);
    };

    let appTheme = createMuiTheme(Object.assign(baseTheme, auth.siteTheme));
    appTheme = responsiveFontSizes(appTheme, {factor: 20});
    if (process.env.NODE_ENV === "development") {
        console.log(appTheme);
    }

    const ROUTES = [];
    for (let entity_type in VIEW_ROUTES) {
        for (let verb in VIEW_ROUTES[entity_type]) {
            let path = VIEW_ROUTES[entity_type][verb];
            if (verb === 'members') {
                ROUTES.push(<Route key={path} path={path} component={MemberList}/>);
            } else if (verb === 'id') {
                ROUTES.push(<Route key={path} path={path} component={EntityView}/>);
            } else {
                ROUTES.push(<Route key={path} path={path} component={Dashboard}/>);
            }
        }
    }

    for (let entity_type in FORM_ROUTES) {
        for (var bundle in FORM_ROUTES[entity_type]) {
            for (var verb in FORM_ROUTES[entity_type][bundle]) {
                var path = FORM_ROUTES[entity_type][bundle][verb];
                ROUTES.push(<Route key={path} path={'/forms' + path} component={FormWrapper}/>);
            }
        }
    }

    return (
        <ThemeProvider theme={appTheme}>
            <UserContextProvider>
                <SnackbarProvider
                    maxSnack={3}
                    ref={notistackRef}
                    action={(key) => <CancelIcon onClick={() => onClickDismiss(key)}/>}
                >
                    <div
                        className="App"
                        id={appTheme.palette.type === "dark" ? "darkMode" : "lightMode"}
                        style={{backgroundColor: appTheme.palette.background.default}}
                    >
                        <Router>
                            <Dialog open={isOpen}>
                                <div style={{padding: 30}}>
                                    <p style={{textAlign: "right", marginBottom: 30}}>
                                        <Button
                                            color="primary"
                                            variant="contained"
                                            onClick={() => closeWarning(false)}
                                        >
                                            Close
                                        </Button>
                                    </p>
                                    <p>
                                        This site is just a prototype. If interested please share
                                        your ideal{" "}
                                        <NavLink
                                            onClick={() => closeWarning(false)}
                                            to={"/templates"}
                                        >
                                            meeting template
                                        </NavLink>
                                    </p>
                                    <p>
                                        To subscribe, visit the live site{" "}
                                        <a
                                            href="https://democrasee.club"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Democrasee.club
                                        </a>
                                        .
                                    </p>
                                </div>
                            </Dialog>
                            <Header/>

                            <Switch>
                                <Route exact path="/signin" component={SignIn}/>
                                <Route exact path="/signup" component={SignIn}/>

                                {ROUTES}

                                <Route path="/sponsors" component={Sponsors}/>
                                <Route exact path="/templates" component={RallyTemplates}/>
                                <Route exact path="/templates/:mid" component={MeetingTemplate}/>
                                <Route path="/about" component={About}/>
                                <Route path="/ethics" component={Ethics}/>
                                <Route path="/" component={Home}/>

                            </Switch>

                            <Footer dispatch={props.dispatch}/>
                        </Router>
                    </div>
                </SnackbarProvider>
            </UserContextProvider>
        </ThemeProvider>
    );
}

export default App;
