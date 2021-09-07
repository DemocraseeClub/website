import React from "react";
import PdfIcon from "@material-ui/icons/PictureAsPdf";

class MediaItem extends React.Component {

    trackClick(id) {
        // window.logUse.logEvent("media-click", {id: id});
    }

    render() {
        const {type, url} = this.props;
        if (type === 'media--image') {
            return <img src={url}  style={{maxWidth: '100%', textAlign: 'center'}} alt={this.props.title || url.substr(url.lastIndexOf('/'))} />;
        } else if (type === 'media--video') {
            return <video src={url} controls preload={'metadata'} style={{width:'100%', maxHeight:'300'}} />;
        } else if (type === 'media--remote_video') {
            return <video src={url} controls preload={'metadata'} />; // TODO: implement ReactPlayer
        } else if (type === 'media--document') {
            // icons per doc type
            return <PdfIcon />
        }
        return null;
    }
}

export default MediaItem;
