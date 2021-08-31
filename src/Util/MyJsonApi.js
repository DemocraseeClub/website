/* eslint no-console: 0 */
/* eslint no-useless-constructor: 0 */

import Config from '../Config';

/*
moment.relativeTimeThreshold('d', 30*12);
moment.updateLocale('en', {
    relativeTime : {
        future: "in %s",
        past:   "%s ",
        s:  "s",
        m:  "m",
        mm: "%d m",
        h:  "h",
        hh: "%d h",
        d:  "d",
        dd: "%d d",
        M:  "a mth",
        MM: "%d mths",
        y:  "y",
        yy: "%d y"
    }
});
 */

class MyJsonApi {

    constructor(json, included) {
        this.json = json;
        this.included = included;
    }

    getItem() {
        return this.json;
    }

    count(field, prop) {
        if (typeof this.json[field] === 'undefined') return -1;
        if (typeof this.json[field] === 'number' || typeof this.json[field] === 'string') return 0; // this isn't a array and can't be looped
        if (typeof this.json[field] === 'boolean') return 0;
        return this.json[field].length;
    }

    getMediaSource(delta) {
        if (!this.json['relationships'].field_media) return null;
        if (!delta) delta = 0;
        let mediaRel = (delta) ? this.json.relationships.field_media.data[delta] : this.json.relationships.field_media.data[0];
        if (!mediaRel) return null; // || !rel.relationships

        let media = this.included.find(o => o.id === mediaRel.id);

        let props = ['field_media_image', 'field_media_document', 'field_media_video_file', 'field_media_audio_file', 'field_media_oembed_video', 'thumbnail'];

        let file = false;
        for (let r in media.relationships) {
            if (props.indexOf(r) > -1) {
                file = this.included.find(o => o.id === media.relationships[r].data.id)
            }
        }
        if (!file) return null;
        return Config.api.cdn + file.attributes.uri.url;
    }

    // field_media, included.id > relationships
    get(field, prop, delta) { // field_media, field_media_image.url
        if (this.json['attributes'][field] && this.json['attributes'][field][prop]) return this.json['attributes'][field][prop];
        if (!this.json['relationships'][field]) return null; //  || this.json['relationships'][field].data.length === 0

        if (!delta) delta = 0;
        let rel = (delta) ? this.json['relationships'][field].data[delta] : this.json['relationships'][field].data[0];
        if (!rel) return null;

        if (rel[prop]) return rel[prop];
        if (!rel.id) return null


        let included = this.included.find(o => o.id === rel.id); // get included.media--image
        if (!included) return included;
        if (included && included['attributes'][prop]) return included['attributes'][prop];

        included = this.included.find(o => o.id === included.relationships.id); // included.media--image.relationships[type= file--file
        if (!included) return included;
        if (included && included['attributes'][prop]) return included['attributes'][prop];

        return null;
    }

    canEdit(me) {
        // compare uid | roles..
    }
}

export default MyJsonApi;
