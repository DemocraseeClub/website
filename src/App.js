import React from 'react';
import './App.css';
import Home from './views/Home';
import About from './views/About';
import Ethics from './views/Ethics';
import City from './views/City';
import Rallies from "./views/Rallies";
import {BrowserRouter as Router, Switch, Route} from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Topics from "./views/Topics";
import Resources from "./views/Resources";
import RallyHome from "./views/RallyHome";
import MeetingHome from "./views/MeetingHome";
import RallyTemplates from "./views/RallyTemplates";
//import Button from '@material-ui/core/Button';
//import Dialog from '@material-ui/core/Dialog';

function App() {
    /* const [isOpen, closeWarning] = React.useState(true);
    <Dialog open={isOpen} >
        <div style={{padding:30}}>
            <p style={{textAlign:'right', marginBottom:30}}>
                <Button color='primary' variant='contained' onClick={e => closeWarning(false)}>Close</Button>
            </p>
            <p>This site is our staging server for prototyping and testing our tools and applications</p>
            <p>To sign up for the live site go to <a href="https://democrasee.club" target="_blank">Democrasee.club</a>.</p>
        </div>
    </Dialog>
    */

    return (
        <div className="App">
                <Router>
                    <Header />
                    <Switch>

                        <Route path="/rallies"><Rallies/></Route>
                        <Route path="/cities"><City /></Route>
                        <Route path="/values"><Topics/></Route>
                        <Route path="/resources"><Resources/></Route>

                        <Route path="/user/create"><City/></Route>
                        <Route path="/user/:uid/update"><City/></Route>

                        <Route path="/city/officials/:oid"><City/></Route>
                        <Route path="/city/officials"><City/></Route>
                        <Route path="/city/:cid"><City/></Route>

                        <Route path="/rally/:rid/meeting/:mid"><MeetingHome /></Route>
                        <Route path="/rally/templates"><RallyTemplates /></Route>
                        <Route path="/rally/:rid"><RallyHome /></Route>

                        <Route path="/about"><About/></Route>
                        <Route path="/ethics"><Ethics/></Route>
                        <Route path="/users"><Ethics/></Route>

                        <Route path="/"><Home/></Route>
                    </Switch>
                    <Footer />
                </Router>
        </div>
    );
}

export default App;
