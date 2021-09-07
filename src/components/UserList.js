import React from "react";
import {withStyles} from "@material-ui/core/styles";
import {rallyStyles} from "../Util/ThemeUtils";
import {withSnackbar} from "notistack";
import {Card, CardActions, CardContent} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import SanitizedHTML from "react-sanitized-html";
import Grid from "@material-ui/core/Grid";
import {NavLink} from "react-router-dom";
import OfficeHours from "./OfficeHours";
import Config from "../Config";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import Avatar from "@material-ui/core/Avatar";
import ListItemText from "@material-ui/core/ListItemText";
import MyJsonApi from "../Util/MyJsonApi";

class UserList extends React.Component {


    render() {

        if (!this.props.users) return null;

        this.props.users.map((u, i) => {
            if (typeof u.get !== 'function') {
                u = new MyJsonApi(u);
            }
            /*
            <AvatarGroup max={7} spacing={8}>
                                    {this.state.profiles.map((r, i) =>
                                        <Avatar component={NavLink} to={'/citizen/' + r?.id}
                                                key={'speakerGroup-' + i} title={r?.displayName}
                                                alt={r?.displayName} src={r?.picture}/>
                                    )}
                                </AvatarGroup>

             */

            return <ListItem key={'users-' + u.getAttr('id')} component={NavLink}
                             to={r.uid ? '/citizen/' + r.uid : '/c/subscriptions#new/'}>
                <ListItemIcon>
                    {r.picture ? <Avatar alt={r.displayName} src={r.picture}/>
                        :
                        <Avatar>{r.icon || r.displayName}</Avatar>}
                </ListItemIcon>
                <ListItemText primary={r.displayName} secondary={r.tagline}/>
            </ListItem>
        })
    }
}

export default withStyles(rallyStyles, {withTheme: true})(UserList);
