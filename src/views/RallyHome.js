import {normalizeRally} from '../redux/entityDataReducer';
import React, {Component} from 'react';
import {withRouter} from 'react-router';
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Avatar from "@material-ui/core/Avatar";
import AvatarGroup from "@material-ui/lab/AvatarGroup";
import ProgressLoading from "../components/ProgressLoading";
import RallyBlock from "../components/RallyBlock";
import {NavLink} from "react-router-dom";
import Paper from "@material-ui/core/Paper";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from '@material-ui/core/ListItemText';
import Box from "@material-ui/core/Box";
import Config from "../Config";
import SanitizedHTML from "react-sanitized-html";
import moment from "moment";
import Button from "@material-ui/core/Button";
import InsertPhoto from "@material-ui/icons/InsertPhoto";
import { DiscussionEmbed } from 'disqus-react';

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
        super(p);
        this.state = {
            editMode: false,
            loading: true,
            profiles: [],
            rally: false,
            error: null};
    }

    componentDidMount() {
        this.refresh();
    }

    componentDidUpdate(prevProps) {
        if (this.props.location.pathname !== prevProps.location.pathname || this.props.location.search !== prevProps.location.search) {
            this.refresh();
        }
    }

    async refresh() {
        const roomRef = window.fireDB.collection("rallies").doc(this.props.match.params.rid)
        let doc = await roomRef.get();
        if (doc.exists) {
            let rally = await normalizeRally(doc, ["author", "picture", "promo_video", "meetings", "topics", "stakeholders", "wise_demo"]);
            let meeting = false;
            if(rally.meetings && rally.meetings.length > 0) {
                meeting = rally.meetings[0];
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

  
            this.setState({rally, meeting, loading:false, error:false, profiles})
        } else {
            this.setState({rally:false, loading:false, error:'invalid id'})
        }
    }

    render() {

         if (this.state.loading === true) return <ProgressLoading/>;
        if (this.state.error) return <div style={{width: '100%', textAlign: 'center', margin: '20px auto'}}><Typography variant='h2'>{this.state.error}</Typography></div>;
        const {rally} = this.state;
         const {classes,  meeting} = this.props;

        console.log(meeting)

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

        

        let start = !meeting || !meeting.start_end_times || !meeting.start_end_times.date_start ? false : moment(meeting.start_end_times.date_start.seconds * 1000);




        return (
                <Paper elevation={0}>
                 <Grid className="rallyheadstyle" container justify={'space-around'} alignContent={'center'} >

                    <RallyBlock rally={rally} meeting={this.state.meeting} />
                    <Grid container  className="rallyFeatured">
                     <Grid item sm={12} md={8} style={{textAlign:'left', paddingRight:8}}>

                     <Grid container  className="mainsectionstyles">
                     <Grid item xs={12}>

                     {(rally.picture) ?
                                <div className="circlecrop"><img alt={rally.title} src={rally.picture} style={{maxWidth: '100%', textAlign:'center'}} /></div>
                                :
                                <Box p={2} ml={4}>
                                    <Button variant={'contained'} disableElevation={true} color={'secondary'}
                                            startIcon={<InsertPhoto/>}>Cover Image</Button>
                                </Box>
                            }
                     <Typography variant={'subtitle2'}>
                        {tags}
                    </Typography>
                     {start && start.isAfter() ?
                        <Box mt={4} p={1} className={classes.roundtable} >
                            {/* TODO: navigate "Apply to Speak" to custom form based on http://localhost:3000/c/subscriptions#new */}
                            {this.state.profiles.map((r,i) =>
                                <ListItem key={'speakerTable-'+ i} className={classes.roundtableSeat} style={ROUNDTABLEMAP[i]} component={NavLink} to={r.uid ? '/citizen/'+r.uid : '/c/subscriptions#new/'}>
                                    <ListItemIcon>
                                        {r.picture ? <Avatar alt={r.displayName} src={r.picture} />
                                        :
                                        <Avatar>{r.icon || r.displayName}</Avatar>}
                                    </ListItemIcon>
                                    <ListItemText primary={r.displayName} secondary={r.tagline}/>
                                </ListItem>
                                )}
                        </Box>
                        :
                        <Box mt={4} p={1} >
                            <AvatarGroup max={7} spacing={8}>
                                {console.log(this.state.profiles, "profiles")}
                                {this.state.profiles.map((r, i) =>  
                                    <Avatar component={NavLink} to={'/citizen/'+r?.id} key={'speakerGroup-'+ i}  title={r?.displayName} alt={r?.displayName} src={r?.picture}/>
                                )}
                            </AvatarGroup>
                        </Box>
                        }
                        </Grid>

                     <Grid item xs={12}>
                     <Typography variant='subtitle1' style={{marginTop:30, marginBottom:0}}>UPCOMING MEETINGS</Typography>


                          <Box className="rallymeetingsstyle" component={"div"} p={3}>
                    {!rally.meetings ? '' :
                    (rally.meetings.length === 0)
                        ?
                        <span>No meetings yet. <u onClick={() => window.logUse.logEvent('rally-subscribe', {'id':this.props.match.params.rid})}>Subscribe</u> to help schedule one</span>
                        :
                            <React.Fragment>
                                <List component="nav" aria-label="rally meetings">
                                {rally.meetings.map((r, i) => {
                                    return (<ListItem button  key={r.title + '-' + i} component={NavLink} to={`/rally/${rally.id}/meeting/${r.id}`} >
                                        <ListItemText primary={r.title} secondary={r.start_end_times?.date_start?.seconds
                                        ? moment(r.start_end_times?.date_start?.seconds * 1000).format('dddd, MMMM Do YYYY, h:mm a') : 'Meeting date not yet set'} />
                                        <Button className="bluebtn">View Details</Button>
                                    </ListItem>)
                                })}
                                </List>
                            </React.Fragment>
                    }
                    </Box>


                      <Typography variant='subtitle1' style={{marginTop:30, marginBottom:0}}>RALLY DETAILS</Typography>

                         <div className="rallymaindescription">
                  

                        <Box p={1} >

                        {rally.description ? <SanitizedHTML
                            allowedTags={Config.allowedTags}
                            allowedAttributes={Config.allowedAttributes}
                            html={rally.description} /> : ''}


                        </Box>
                        </div>

                        </Grid>
                        </Grid></Grid>

                    <Grid item sm={12} md={4} style={{textAlign:'left', paddingRight:8}}>

                    <div className="rallyvideo">

                    {rally.promo_video && rally.promo_video.indexOf('http') === 0 ?
                            <video controls width={'100%'}>
                                <source src={rally.promo_video} type="video/mp4" />
                            </video> : ''}
                            </div>

                            <Grid container justify={'space-around'} alignContent={'center'} >
                   


                    {rally.research && rally.research.length > 0 &&
                        <Box mt={4} p={3} style={{width:'100%'}}>
                            <Typography variant='subtitle1' style={{marginTop:30, marginBottom:0}}>RESEARCH</Typography>
                            <List component="nav" aria-label="research links">
                                {rally.research.map(r => {
                                    return <a href={r.link} target='_blank'><ListItem button key={r.link}><div className="researchbox">
                                        {r.img && <ListItemIcon>
                                          <img src={r.img} height={20} alt={'source logo'} />
                                        </ListItemIcon>}
                                        <ListItemText primary={r.title} />
                                    </div></ListItem></a>
                                })}
                            </List>
                        </Box>
                    }

                </Grid>
                            

                    </Grid>
                    </Grid>
                    </Grid>
                 <Grid container className="mainsectionstyles" justify={'space-around'} alignContent={'center'} >

                 <Grid item xs={12} sm={12} style={{textAlign:'left', paddingRight:8}}>
     <DiscussionEmbed
    shortname='democraseeclub'
    config={
        {
            url: 'http://democraseeclub.web.app/rally/8ghDgZWvr9XZvDOHQ7E8',
            identifier: '8ghDgZWvr9XZvDOHQ7E8',
            title: 'Cash for Local Crops'
        }
    }
/>
      </Grid>
                </Grid>

                  
                </Paper>
        );
    }
}

export default withRouter(RallyHome);
