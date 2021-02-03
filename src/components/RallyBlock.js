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
import InsertPhoto from "@material-ui/icons/InsertPhoto";
import Create from "@material-ui/icons/Create";
import {withSnackbar} from "notistack";
import Config from "../Config";
import SanitizedHTML from "react-sanitized-html";

class RallyHome extends Component {

    constructor(p) {
        super(p);
        this.state = {editMode: p.editMode || false};
    }

    render() {
        const {classes, rally} = this.props;

        let tags = ['wisedemo', 'targets', 'topics', 'stackholders'].reduce((acc, val) => {
            if (rally[val]) {
                acc = acc.concat(rally[val]);
            }
            return acc;
        }, [])
        if (tags.length > 0) {
            tags = [<div key={'tags'}>{tags.join(' ● ')}</div>]
        }
        if (rally.type === 'meeting') {
            let href = document.location.pathname.split('/').slice(0, 3).join('/');
            tags.push(<NavLink key={'series'} to={href}>Rally Series</NavLink>)
        }

        return (
            <div className={classes.root} style={{height: '100%'}}>
                <Box p={1} style={{textAlign: 'center', borderBottom: '1px solid #ccc', marginBottom: 20}} z>
                    <Typography variant={'subtitle2'}>
                        {tags}
                    </Typography>
                </Box>
                <Grid container justify={'space-around'} alignContent={'center'}>
                    <Grid item xs={12} sm={6} style={{textAlign:'center'}}>
                        {rally.videofile ?
                            <video style={{width:'100%'}} height="240" controls>
                                <source src={rally.videofile} type="video/mp4" />
                            </video> : ''}
                        {(rally.profile) ?
                            <img alt={rally.title} src={rally.profile} style={{maxWidth: '100%', textAlign:'center'}}/>
                            :
                            <Box p={2} ml={4}>
                                <Button variant={'contained'} disableElevation={true} color={'secondary'}
                                        startIcon={<InsertPhoto/>}>Cover Image</Button>
                            </Box>
                        }
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant='h1' className={classes.title} color={'error'}>{rally.title}</Typography>
                        {rally.desc ? <SanitizedHTML
                            allowedIframeDomains={['youtube.com', 'google.com']}
                            allowedIframeHostnames={['www.youtube.com', 'docs.google.com', 'sheets.google.com']}
                            allowIframeRelativeUrls={false}
                            allowedSchemes={[ 'data', 'https' ]}
                            allowedTags={Config.allowedTags}
                            allowedAttributes={Config.allowedAttributes}
                            exclusiveFilter={frame => {
                                if (frame.tag === 'iframe') {
                                    console.log(frame);
                                    if (frame.attribs.src.indexOf('https://docs.google.com') !== 0 && frame.attribs.src.indexOf('https://sheets.google.com') !== 0) {
                                        return true;
                                    }
                                }
                                return false;
                            }}
                            html={rally.desc} /> : ''}

                        <Box mt={4}>
                            <div>Hosts</div>
                            <AvatarGroup>
                                {rally.hosts.map(r => <Avatar key={r.img} alt={r.name} src={r.img}/>)}
                                {rally.speakers && rally.speakers.map(r => <Avatar key={r.img} alt={r.name} src={r.img}/>)}
                                <Avatar alt="add" onClick={e => alert('TODO: Join rally')}>+</Avatar>
                            </AvatarGroup>
                        </Box>

                        <Box mt={8}>
                            <Button startIcon={<Create/>} variant={'contained'}
                                    color={this.state.editMode ? 'primary' : 'secondary'}
                                    onClick={e => this.props.enqueueSnackbar('Sorry, editing the Rally is not ready yet.')}>Edit Rally</Button>
                        </Box>

                    </Grid>
                </Grid>

            </div>
        );
    }
}

export default withStyles(rallyStyles, {withTheme: true})(withSnackbar(RallyHome));
