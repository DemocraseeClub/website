import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import {Link} from "react-router-dom";
import Paper from '@material-ui/core/Paper';
import Typography from "@material-ui/core/Typography";


class Ethics extends React.Component {

    render() {
        // const {classes} = this.props;
        return (
            <Paper style={{margin:20, padding:20}}>
                <Typography variant="h4" style={{marginTop:50}} >
                    User Privacy Policy
                </Typography>
                <Typography variant="subtitle1" >
                    This site uses cookies through <a href={"https://analytics.google.com"} target={'_blank'}>Google Anayltics</a> to track engagement for the sole purpose of prioritizing our application development efforts. We also use cookies through <a href={"https://firebase.google.com/"} target={'_blank'}>Firebase</a> for the sole purpose of authentication.
                </Typography>
                <Typography variant="h4" style={{marginTop:50}} >
                    Content Ownership Policy
                </Typography>
                <Typography variant="subtitle1" >
                    Content is always and forever owned by its original authors. By posting here you grant Democra<em>see</em> a worldwide license to publish your posts on this site, newsletters, social media shares and through other marketing channels. You may revoke this license at anytime by deleting your post.
                </Typography>
                <Typography variant="h4" style={{marginTop:50}} >
                    Content Moderation Guidelines
                </Typography>
                <Typography variant="subtitle1" >
                    Any content deleted or censored can be appealed. All appeals will be posted publically for full transparency.
                </Typography>
            </Paper>
        );
    }

}


const useStyles = theme => ({
    root: {
        width: '100%',
    }
});

export default withStyles(useStyles, {withTheme:true})(Ethics);
