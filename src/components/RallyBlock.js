import React, {Component} from 'react';
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Avatar from "@material-ui/core/Avatar";
import AvatarGroup from "@material-ui/lab/AvatarGroup";
import {rallyStyles} from '../Util/ThemeUtils';
import {withStyles} from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import {NavLink} from "react-router-dom";
import Button from "@material-ui/core/Button";
// import PersonIcon from "@material-ui/icons/Person";
import InsertPhoto from "@material-ui/icons/InsertPhoto";
import {withSnackbar} from "notistack";
import Config from "../Config";
import SanitizedHTML from "react-sanitized-html";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";

const ROUNDTABLEMAP = [
    {top:39, left:181},
    {top:97, left:300},
    {top:218, left:334},
    {top:321, left:255},
    {top:325, left:-118, flexDirection:'row-reverse'},
    {top:227, left:-204, flexDirection:'row-reverse'},
    {top:103, left:-179, flexDirection:'row-reverse'}
]

class RallyHome extends Component {

    constructor(p) {
        console.log("RENDER RALLY", p.rally);
        super(p);
        this.state = {editMode: p.editMode || false};
    }

    trackSubscribe(event, id) {
        this.props.enqueueSnackbar('We track clicks on this to prioritize development and schedule. Please only click once for any rallies you are interested in');
        window.logUse.logEvent('rally-'+event, {'id':id});
    }

    render() {
        const {classes, rally} = this.props;
        const meeting = rally?.meetings && rally.meetings.length > 0 ? rally.meetings[0] : false;

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

        let profiles = [];
        if (meeting !== false) {
            profiles = (meeting.speakers) ? meeting.moderators.concat(meeting.speakers) : meeting.moderators;
        }
        while(profiles.length < 7) {
            profiles.push({name:'Apply to Speak', icon:'+'})
        }

        return (
            <React.Fragment>
                <Box p={1} style={{textAlign: 'center', borderBottom: '1px solid #ccc', marginBottom: 20}} >
                    <Typography variant={'subtitle2'}>
                        {tags}
                    </Typography>
                </Box>
                <Grid container justify={'space-around'} alignContent={'center'} >
                    {rally.videofile ?
                        <Grid item xs={12} sm={6} style={{textAlign:'center', paddingRight:8}}>
                            <video controls width={'100%'}>
                                <source src={rally.videofile} type="video/mp4" />
                            </video></Grid> : ''}
                    <Grid item xs={12} sm={6} style={{textAlign:'center', paddingRight:8}}>
                        {(rally.picture) ?
                            <img alt={rally.title} src={rally.picture} style={{maxWidth: '100%', textAlign:'center'}} />
                            :
                            <Box p={2} ml={4}>
                                <Button variant={'contained'} disableElevation={true} color={'secondary'}
                                        startIcon={<InsertPhoto/>}>Cover Image</Button>
                            </Box>
                        }
                    </Grid>
                    <Grid item >
                        <Box p={1}>
                        <Typography variant='h1' className={classes.title} color={'error'}>{rally.title}</Typography>
                        {rally.desc ? <SanitizedHTML
                            allowedTags={Config.allowedTags}
                            allowedAttributes={Config.allowedAttributes}
                            html={rally.desc} /> : ''}

                        {!meeting || !meeting.start || meeting.start === 'tomorrow' ?
                            <Box mt={4}>
                                <Button variant={'contained'} color={'primary'} style={{marginRight:15}} onClick={() => this.trackSubscribe('speak', rally.title) }>Apply to Speak</Button>
                                <Button variant={'contained'} color={'secondary'} onClick={() => this.trackSubscribe('subscribe', rally.title) }>Subscribe to Schedule</Button>
                            </Box>
                            :
                            <Typography variant='h6' >{meeting.start}</Typography>
                        }
                        </Box>

                        {meeting.start && new Date(meeting.start) > new Date().getTime() ?
                        <Box mt={4} p={1} className={classes.roundtable} >
                            {profiles.map((r,i) =>
                                <ListItem key={'speakerTable-'+ i} className={classes.roundtableSeat} style={ROUNDTABLEMAP[i]} >
                                    <ListItemIcon>
                                        {r.img ? <Avatar alt={r.name} src={r.img} />
                                        :
                                        <Avatar>{r.icon || r.name}</Avatar>}
                                    </ListItemIcon>
                                    <ListItemText primary={r.name} secondary={r.tagline}/>
                                </ListItem>
                                )}
                        </Box>
                        :
                        <Box mt={4} p={1} >
                            <AvatarGroup>
                                {profiles.map((r, i) => r.img ?
                                    <Avatar key={'speakerGroup-'+ i} alt={r.name} src={r.img} />
                                    :
                                    <Avatar key={'speakerGroup-'+ i} >{r.icon || r.name}</Avatar>)}
                            </AvatarGroup>
                        </Box>
                        }


                    </Grid>


                    {(rally.research_json && rally.research_json.length > 0)
                        ?
                        <Box mt={4} p={3} style={{width:'100%'}}>
                            <Typography variant='subtitle1' style={{marginTop:30, marginBottom:0}}>RESEARCH</Typography>
                            <List component="nav" aria-label="research links">
                                {rally.research_json.map(r => {
                                    return <ListItem button key={r.link}>
                                        {r.img && <ListItemIcon>
                                            <img src={r.img} height={20} alt={'source logo'} />
                                        </ListItemIcon>}
                                        <ListItemText primary={<a href={r.link} target='_blank'>{r.title}</a>} />
                                    </ListItem>
                                })}
                            </List>
                        </Box> : ''
                    }

                </Grid>

            </React.Fragment>
        );
    }
}

export default withStyles(rallyStyles, {withTheme: true})(withSnackbar(RallyHome));
