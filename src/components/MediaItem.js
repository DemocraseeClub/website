import React from "react";
import PdfIcon from "@material-ui/icons/PictureAsPdf";
import ReactPlayer from 'react-player'


class MediaItem extends React.Component {

    trackClick(id) {
        // window.logUse.logEvent("media-click", {id: id});
    }

    render() {
        const {media} = this.props;

        let passAlong = {}
        if (media.thumbnail) {
            passAlong.fileConfig = { attributes: { poster: media.thumbnail } }
        }

        if (media.type === 'media--image') {
            return <img src={media.url}  style={{maxWidth: '100%', textAlign: 'center'}} alt={media.name} />;
        } else if (media.type === 'media--video') {
            return <ReactPlayer url={media.url} controls preload={'metadata'} width={'100%'} {...passAlong} />
        } else if (media.type === 'media--remote_video') {
            return <ReactPlayer url={media.url} controls  width={'100%'} {...passAlong} />
        } else if (media.type === 'media--document') {
            // icons per doc type
            return <PdfIcon />
        }
        return null;
    }
}

export default MediaItem;
