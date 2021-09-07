import React, {Component} from 'react';
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import {rallyStyles} from '../Util/ThemeUtils';
import {withStyles} from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import {withSnackbar} from "notistack";
import moment from "moment";
import DialogSubscription from "./DialogSubscriptions"
import userContext from '../contexts/userContext';

class RallyBlock extends Component {

    static contextType = userContext

    constructor(p) {
        super(p);
        this.state = {editMode: p.editMode || false};
    }

    trackSubscribe(event, id) {
        let {rally, meeting} = this.props

        if (!this.context.user || !this.context.user.uid) {
            this.props.enqueueSnackbar('Please sign-in or sign-up to subscribe', {variant: 'error'});
        } else if (rally && meeting) {
            let subRef = window.fireDB.collection("subscriptions").doc()
            subRef.set({
                subscriber: window.fireDB.collection("users").doc(this.context.user.uid),
                rally: window.fireDB.collection("rallies").doc(rally.id),
                meeting: window.fireDB.collection("rallies").doc(rally.id).collection("meetings").doc(meeting.id),
                status: "pending"
            })
                .then(() => {
                    this.props.enqueueSnackbar(event === 'speak' ? 'Application pending approval' : "Thank you. We'll notify you as this rally grows");
                }).catch(e => {
                this.props.enqueueSnackbar('ERROR: ' + e.message, {variant: 'error'});
            })
        }
        window.logUse.logEvent('rally-' + event, {'id': id});
    }

    render() {
        const {rally, meeting} = this.props;
        let start = meeting && meeting.get('field_date_range', 'value') ? moment(meeting.get('field_date_range', 'value')) : false;

        return (
            <Grid container justify={'space-between'} alignContent={'center'}>
                <Grid item>
                    <Typography variant='h1'>{rally.getAttr('title')}</Typography>
                    {start && <Typography variant='h6'>{start.format('dddd, MMMM Do YYYY, h:mm a')}</Typography>}
                </Grid>
                <Grid item>
                    <Button variant={'contained'} className="bluebtn"
                            onClick={() => this.trackSubscribe('speak', rally.getAttr('title'))}>Apply to Speak</Button>
                    <Button variant={'contained'} className="redbtn"
                            onClick={() => this.trackSubscribe('subscribe', rally.getAttr('title'))}>Join This
                        Rally</Button>
                    {
                        this.context.user && this.context.user.uid === rally.get('uid', 'id') &&
                        <DialogSubscription rallyId={rally.getAttr('id')}/>
                    }
                </Grid>
            </Grid>
        );
    }
}

export default withStyles(rallyStyles, {withTheme: true})(withSnackbar(RallyBlock));
