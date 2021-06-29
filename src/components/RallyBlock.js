import React, {Component} from 'react';
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import {rallyStyles} from '../Util/ThemeUtils';
import {withStyles} from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import {NavLink} from "react-router-dom";
import Button from "@material-ui/core/Button";
import InsertPhoto from "@material-ui/icons/InsertPhoto";
import {withSnackbar} from "notistack";
import moment from "moment";
import DialogSubscription from "./DialogSubscriptions"
import userContext from '../contexts/userContext';


class RallyHome extends Component {

    static contextType = userContext

    constructor(p) {
        super(p);
        this.state = {editMode: p.editMode || false};
    }

    componentDidMount() {
        const user = this.context;

        console.log(user, "user")
      }

     trackSubscribe(event, id) {
        let {rally, meeting} = this.props

        if (!this.context.user || !this.context.user.id) {
            this.props.enqueueSnackbar('Please sign-in or sign-up to subscribe', {variant:'error'});
        } else if(rally && meeting) {
            let subRef = window.fireDB.collection("subscriptions").doc()
            subRef.set({
                subscriber: window.fireDB.collection("users").doc(this.context.user.uid),
                rally: window.fireDB.collection("rallies").doc(rally.id),
                meeting: window.fireDB.collection("rallies").doc(rally.id).collection("meetings").doc(meeting.id),
                status: "pending"
            })
                .then(() => {
                    this.props.enqueueSnackbar('You have applied!');
                }).catch(e => {
                this.props.enqueueSnackbar('ERROR: ' + e.message, {variant: 'error'});
            })
        }
        window.logUse.logEvent('rally-'+event, {'id':id});
    }

    render() {
        const {classes, rally, meeting} = this.props;


        let tags = ['wise_demo', 'topics', 'stakeholders'].reduce((acc, val) => {
            if (rally[val]) {
                acc = acc.concat(rally[val].map(o => o.name));
            }
            return acc;
        }, [])
        if (tags.length > 0) {
            tags = [<div key={'tags'}>{tags.join(' ● ')}</div>]
        }
        if (document.location.pathname.indexOf('/meetings/') > -1) {
            let href = document.location.pathname.split('/').slice(0, 3).join('/');
            tags.push(<NavLink key={'series'} to={href}>Rally Series</NavLink>)
        }

        let profiles = [], dups = {};
        if (meeting) {
            if (meeting.moderators) {
                meeting.moderators.forEach(user => {
                    if (!dups[user.id] && user.displayName) {
                        dups[user.id] = true;
                        profiles.push(user);
                    }
                })
            }

            if (meeting.speakers) {
                meeting.speakers.forEach(user => {
                    if (!dups[user.id] && user.displayName) {
                        dups[user.id] = true;
                        profiles.push(user);
                    }
                })
            }

        }
        while(profiles.length < 7) {
            profiles.push({displayName:'Apply to Speak', icon:'+'})
        }

        console.log("PROFILES", profiles);

        let start = !meeting || !meeting.start_end_times || !meeting.start_end_times.date_start ? false : moment(meeting.start_end_times.date_start.seconds * 1000);

        return (
            <React.Fragment>

                <Grid className="rallyheadstyle" container justify={'space-around'} alignContent={'center'} >

                    <Grid item xs={12} sm={4} style={{textAlign:'left', paddingRight:8}}>
                        {(rally.picture) ?
                                <img alt={rally.title} src={rally.picture} style={{maxWidth: '100%', textAlign:'center'}} />
                                :
                                <Box p={2} ml={4}>
                                    <Button variant={'contained'} disableElevation={true} color={'secondary'}
                                            startIcon={<InsertPhoto/>}>Cover Image</Button>
                                </Box>
                            }

                    </Grid>

                    <Grid item xs={12} sm={8} style={{textAlign:'left', paddingRight:8}}>
                    <Typography variant={'subtitle2'}>
                        {tags}
                    </Typography>
                         <Typography variant='h1' className={classes.title} color={'error'}>{rally.title}</Typography>
                         {!start ?
                            <Box mt={4}>
                                <Button variant={'contained'} color={'primary'} style={{marginRight:15}} onClick={() => this.trackSubscribe('speak', rally.title) }>Apply to Speak</Button>
                                <Button variant={'contained'} color={'secondary'} onClick={() => this.trackSubscribe('subscribe', rally.title) }>Join This Rally</Button>
                                {
                                    this.context.user && this.context.user.uid === rally.author.id &&
                                    <DialogSubscription rallyId={rally.id}/>
                                }
                            </Box>
                            :
                            <Typography variant='h6' >{start.format('dddd, MMMM Do YYYY, h:mm a')}</Typography>
                        }

                    </Grid>
                </Grid>

            </React.Fragment>
        );
    }
}

export default withStyles(rallyStyles, {withTheme: true})(withSnackbar(RallyHome));
