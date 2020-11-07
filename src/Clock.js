import React from 'react';
import './App.css';
import PlanList from './components/PlanList';
import rallyData from './data/libel.js';
import {createMuiTheme, ThemeProvider, responsiveFontSizes} from '@material-ui/core/styles';

let appTheme = createMuiTheme({
    palette: {
        primary: {
            main: '#0A5760',
            contrastText: '#C1D5D7'
        },
        secondary: {
            main: '#B9DFF4',
            contrastText: '#002866'
        },
        error: {
            main: '#D65248'
        }
    },
});

appTheme = responsiveFontSizes(appTheme, {factor:20});

function Clock() {
    return (
        <div className="App">
            <ThemeProvider theme={appTheme}>
                <PlanList rallyData={rallyData} />
            </ThemeProvider>
        </div>
    );
}

export default Clock;
