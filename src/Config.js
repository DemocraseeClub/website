const Config = {
    api: {
        base: process.env.REACT_APP_API_URL, // set in .env
        client: process.env.NODE_ENV === 'production' ? 'https://democraseeclub.web.app' : '//localhost:3000'
    },
    allowedTags: ['blockquote', 'p', 'ul', 'li', 'ol', 'dl', 'dd', 'dt', // https://www.npmjs.com/package/sanitize-html
        'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div', 'figure', 'img', 'video', 'audio', 'iframe',
        'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'h2', 'h3', 'h4', 'h5', 'h6', 'small',
        'sup', 'sub', 'center', 'button', 'a', 'u'],
    allowedAttributes: {
        'a': ['href', 'target', 'style'],
        'iframe': ['src', 'allowfullscreen', 'frameborder'],
        '*': ['id', 'style', 'data-toggle', 'data-target', 'aria-label', 'role', 'class'],
        'img': ['src', 'height', 'width', 'style']
    },
    peerConfig: {
        iceServers: [
            {urls: 'turn:numb.viagenie.ca', 'credential': 'KD@)*SDL.ms!4ad', 'username': 'eli@taylormadetraffic.com'},
            {urls: 'stun:stun.services.mozilla.com'},
            {urls: [
                    'stun:stun1.l.google.com:19302',
                    'stun:stun2.l.google.com:19302',
                ]
            }
        ],
        iceCandidatePoolSize: 10
    }
};
export default Config;
