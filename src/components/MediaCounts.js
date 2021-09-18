import React from "react";
import ImageIcon from '@material-ui/icons/Image';
import PictureAsPdf from "@material-ui/icons/PictureAsPdf";
import YouTubeIcon from '@material-ui/icons/YouTube';
import Videocam from "@material-ui/icons/Videocam";
import Speaker from "@material-ui/icons/Speaker";
import Badge from '@material-ui/core/Badge';
import { withStyles } from '@material-ui/core/styles';

const typeMap = {
    // 'image':ImageIcon, // not worth displaying
    'document': PictureAsPdf,
    'video': Videocam,
    'audio': Speaker,
    'remote_video': YouTubeIcon
};

const StyledBadge = withStyles((theme) => ({
    badge: {
        width:15,
        height:15,
        padding: 0,
        fontSize:9,
        borderBottomRightRadius:0,
        fontWeight:'bolder'
    },
    root : {
        marginRight:15,
    }
}))(Badge);

class MediaCounts extends React.Component {

    render() {
        const {counts} = this.props;
        let icons = [];
        for (let type in counts) {
            if (typeMap[type]) {
                const Wrapper = typeMap[type];
                icons.push(<StyledBadge color={'primary'} anchorOrigin={{ vertical: 'top', horizontal: 'left'}}
                                  badgeContent={counts[type]}><Wrapper fontSize={'small'} key={'mtype-' + type} si /></StyledBadge>)
            }
        }
        if (icons.length > 0) {
            return <span style={{marginLeft:14}}>{icons}</span>;
        }

        return null;
    }
}

export default MediaCounts;
