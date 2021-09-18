import React, {Component} from 'react';
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import ProgressLoading from "../components/ProgressLoading";
import RallyBlock from "../components/RallyBlock";
import {NavLink} from "react-router-dom";
import Paper from "@material-ui/core/Paper";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Box from "@material-ui/core/Box";
import Config from "../Config";
import SanitizedHTML from "react-sanitized-html";
import moment from "moment";
import Button from "@material-ui/core/Button";
import API from "../Util/API";
import MyJsonApi from "../Util/MyJsonApi";
import MediaItem from "../components/MediaItem";
import MediaCounts from "../components/MediaCounts";

const ROUNDTABLEMAP = [
    {top: 39, left: 181},
    {top: 97, left: 300},
    {top: 218, left: 334},
    {top: 321, left: 255},
    {top: 325, left: -118, flexDirection: 'row-reverse'},
    {top: 227, left: -204, flexDirection: 'row-reverse'},
    {top: 103, left: -179, flexDirection: 'row-reverse'}
]

class RallyHome extends Component {

    constructor(p) {
        super(p);
        this.state = {
            editMode: false,
            loading: true,
            profiles: [],
            rally: false,
            error: null
        };
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

        API.Get(`/node/rallies/${this.props.match.params.rid}?fields[file--file]=uri,url&include=uid.user_picture,field_topics.field_image,field_media.field_media_video_file,field_media.field_media_image`).then(res => {
            let rally = new MyJsonApi(res.data.data, res.data.included);
            this.setState({loading: false, rally: rally, error: false});


            if (rally.getAttr('field_count_meetings') > 0) {
                API.Get(`/node/meetings?filter[field_rally.id]=${this.props.match.params.rid}&fields[file--file]=uri,url&include=uid.user_picture`).then(res => {
                    let meetings = res.data.data.map(o => new MyJsonApi(o, res.data.included));
                    this.setState({meetings: meetings, error: false});
                });
            }

            if (rally.getAttr('field_count_publications') > 0) {
                API.Get(`/node/publication?filter[field_relationships.id]=${this.props.match.params.rid}&fields[file--file]=uri,url&include=uid.user_picture,field_media.field_media_video_file,field_media.field_media_image`).then(res => {
                    let publications = res.data.data.map(o => new MyJsonApi(o, res.data.included));
                    this.setState({publications: publications, error: false});
                });
            }

        }).catch(e => {
            console.error(e);
            this.setState({loading: false, error: e.message});
        })

    }

    render() {

        if (this.state.loading === true) return <ProgressLoading/>;
        if (this.state.error) return <div style={{width: '100%', textAlign: 'center', margin: '20px auto'}}><Typography
            variant='h2'>{this.state.error}</Typography></div>;

        const {rally, meetings, publications} = this.state;
        const meeting = (meetings && meetings.length > 0) ? meetings[0] : false;
        const {classes} = this.props;

        let tags = ['field_topics'].reduce((acc, val) => { // other taxonomies can be added to this array
            if (rally.json.relationships[val] && rally.json.relationships[val].data) {
                acc = acc.concat(rally.json.relationships[val].data.map((o, i) => rally.get('field_topics', 'name', i)));
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


        let start = meeting && meeting.get('field_date_range', 'value') ? moment(meeting.get('field_date_range', 'value')) : false;

        // TODO: create merged list of users referenced in rally authors, meetings speaker+moderators+authors, publications authors
        const users = rally.json.relationships.uid;
        // print as <UserList users={users} />

        // rally title, (?next meeting time)
        // speakers
        // rally media gallery
        // publications list
        // meetings list

        return (
            <Paper elevation={0} style={{padding:8, margin: 8}}>
                <RallyBlock rally={rally} meeting={meeting}/>

                {rally.get('body', 'processed') ? <SanitizedHTML
                        allowedTags={Config.allowedTags}
                        allowedAttributes={Config.allowedAttributes}
                        html={rally.get('body', 'processed')}/> :
                    rally.get('body', 'summary') ?
                        <p>{rally.get('body', 'summary')}</p>
                        : ''
                }

                {rally.json.relationships.field_media && rally.json.relationships.field_media.data.length > 0 &&
                <Grid container justify={'space-around'} alignContent={'center'} spacing={2} >
                    {rally.json.relationships.field_media.data.map((o, i) =>
                            <Grid xs={6} sm={4} md={3} item key={'rallymedia' + i}>
                                <MediaItem media={rally.getMediaObj(i)}/>
                            </Grid>
                    )}
                </Grid>
                }

                <Typography variant='subtitle1' style={{marginTop: 30, marginBottom: 0}}>UPCOMING MEETINGS</Typography>
                <Box p={3}>
                    {!meetings || meetings.length === 0
                        ?
                        <span>No meetings yet. <u
                            onClick={() => window.logUse.logEvent('rally-subscribe', {'id': this.props.match.params.rid})}>Subscribe</u> to help schedule one</span>
                        :
                        <React.Fragment>
                            <List component="nav" aria-label="rally meetings">
                                {meetings.map((r, i) => {
                                    return (<ListItem button key={r.getAttr('id') + '-' + i}
                                                      component={NavLink}
                                                      to={`/rally/${rally.getAttr('id')}/meeting/${r.getAttr('id')}`}>
                                        <ListItemText primary={r.getAttr('title')}
                                                      secondary={r.get('field_date_range', 'value') ? moment(r.get('field_date_range', 'value')).format('dddd, MMMM Do YYYY, h:mm a') : 'Meeting date not yet set'}/>
                                        <Button className="bluebtn">Details</Button>
                                    </ListItem>)
                                })}
                            </List>
                        </React.Fragment>
                    }
                </Box>


                {publications && publications.length > 0 &&
                <React.Fragment>
                    <Typography variant='subtitle1' style={{marginTop: 30, marginBottom: 0}}>PUBLICATIONS</Typography>
                    <List component="nav" aria-label="rally meetings">
                        {publications.map((r, i) => {
                            let counts = r.getAttr('field_count_media_types');
                            if (counts) {
                                counts = JSON.parse(counts);
                                counts = <MediaCounts counts={counts} />
                            }

                            let title = <div>{r.getAttr('title')} {counts}</div>

                            return (<ListItem button key={r.getAttr('id') + '-' + i}
                                              component={NavLink}
                                              to={`/rally/${rally.getAttr('id')}/publication/${r.getAttr('id')}`}>
                                <ListItemAvatar>
                                        <Avatar src={r.getMediaSourceByType('media--image')} />
                                </ListItemAvatar>
                                <ListItemText primary={title} />
                                <Button className="bluebtn">Open</Button>
                            </ListItem>)
                        })}
                    </List>
                </React.Fragment>
                }


                {rally.research && rally.research.length > 0 &&
                <Box mt={4} p={3} style={{width: '100%'}}>
                    <Typography variant='subtitle1'
                                style={{marginTop: 30, marginBottom: 0}}>RESEARCH</Typography>
                    <List component="nav" aria-label="research links">
                        {rally.research.map(r => {
                            return <a href={r.link} target='_blank'><ListItem button key={r.link}>
                                <div className="researchbox">
                                    {r.img && <ListItemIcon>
                                        <img src={r.img} height={20} alt={'source logo'}/>
                                    </ListItemIcon>}
                                    <ListItemText primary={r.title}/>
                                </div>
                            </ListItem></a>
                        })}
                    </List>
                </Box>
                }
            </Paper>
        );
    }
}

export default RallyHome;
