import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Avatar from '@material-ui/core/Avatar';
import {TEAM} from './About';


class Citizen extends React.Component {

    render() {
        let team = TEAM[this.props.id || 0];

        return (
            <Paper key={team.name} id={'teamstory-' + team.name} style={{padding: 10, margin: '20px 10px'}}>
                <Grid container>
                    <Grid item xs={1}>
                        <Avatar alt={team.name} src={team.img}/>
                    </Grid>
                    <Grid item xs={11}>
                        {team.html}
                    </Grid>
                </Grid>
            </Paper>
        );
    }

}


const useStyles = theme => ({
    root: {
        width: '100%',
    },
    large: {
        width: 100,
        height: 100,
    },
});

export default withStyles(useStyles, {withTheme: true})(Citizen);
