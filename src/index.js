import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
// import PlanList from './components/PlanList';
import * as serviceWorker from './serviceWorker';
import {createMuiTheme, responsiveFontSizes, ThemeProvider} from "@material-ui/core/styles";

let appTheme = createMuiTheme({
    palette: {
        primary: {
            main : '#095760',
            contrastText: '#C1D5D7'
        },
        secondary: {
            main: '#B9DFF4',
            contrastText: '#002866'
        },
        info : {
            main : "#005ea2",
            contrastText : '#ffffff'
        },
        error: {
            light: '#D83933',
            main: '#D83933',
            dark: '#D83933'
        }
    },
});

appTheme = responsiveFontSizes(appTheme, {factor: 20});

ReactDOM.render(
    <React.StrictMode>
        <ThemeProvider theme={appTheme}>
            <App />
        </ThemeProvider>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
