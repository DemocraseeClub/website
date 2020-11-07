import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';


class About extends React.Component {

    render() {
        const {classes} = this.props;
        return (
            <Paper className={classes.root}>
                <Grid container>
                    <Grid item>
                        <figure className="wp-block-image is-resized"><img
                            src="https://democrasee.club/wp-content/uploads/bb-plugin/cache/Screen-Shot-2020-10-11-at-1.18.39-PM-circle.png"
                            alt="Screen Shot 2020-10-11 at 1.18.39 PM" className="wp-image-618 img-fluid" width="216"
                            height="216" title="Screen Shot 2020-10-11 at 1.18.39 PM"/>
                            <figcaption>Polina</figcaption>
                        </figure>
                    </Grid>
                    <Grid item>
                        <figure className="wp-block-image is-resized"><img
                            src="https://democrasee.club/wp-content/uploads/bb-plugin/cache/Screen-Shot-2020-10-11-at-1.18.29-PM-circle.png"
                            alt="Screen Shot 2020-10-11 at 1.18.29 PM" className="wp-image-621 img-fluid" width="234"
                            height="234" title="Screen Shot 2020-10-11 at 1.18.29 PM"/>
                            <figcaption>Marcela</figcaption>
                        </figure>
                    </Grid>
                    <Grid item>
                        <figure className="wp-block-image is-resized"><img
                            src="https://democrasee.club/wp-content/uploads/bb-plugin/cache/Screen-Shot-2020-10-11-at-1.18.18-PM-circle.png"
                            alt="Screen Shot 2020-10-11 at 1.18.18 PM" className="wp-image-619 img-fluid" width="230"
                            height="230" title="Screen Shot 2020-10-11 at 1.18.18 PM"/>
                            <figcaption>Eli</figcaption>
                        </figure>
                    </Grid>
                    <Grid item>
                        <figure className="wp-block-image is-resized"><img
                            src="https://democrasee.club/wp-content/uploads/bb-plugin/cache/Screen-Shot-2020-10-11-at-1.18.06-PM-circle.png"
                            alt="Screen Shot 2020-10-11 at 1.18.06 PM" className="wp-image-620 img-fluid" width="138"
                            height="138" title="Screen Shot 2020-10-11 at 1.18.06 PM"/>
                            <figcaption>Indy</figcaption>
                        </figure>
                    </Grid>
                </Grid>
            </Paper>
        );
    }

}


const useStyles = theme => ({
    root: {
        width: '100%',
    }
});

export default withStyles(useStyles, {withTheme: true})(About);
