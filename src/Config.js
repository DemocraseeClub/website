/*
for turn server's oauth method
const crypto = require('crypto');

function getTURNCredentials(name, secret){
    var unixTimeStamp = parseInt(Date.now()/1000) + 24*3600,
        username = [unixTimeStamp, name].join(':'),
        password,
        hmac = crypto.createHmac('sha1', secret);
    hmac.setEncoding('base64');
    hmac.write(username);
    hmac.end();
    password = hmac.read();
    return {
        username: username,
        password: password
    };
}
*/

const Config = {
    api: {
        base: process.env.REACT_APP_API_URL, // set in .env
        client: process.env.NODE_ENV === 'production' ? 'https://democraseeclub.web.app' : '//localhost:3000'
    },
    allowedTags: ['blockquote', 'p', 'ul', 'li', 'ol', 'dl', 'dd', 'dt',
        'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
        'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'h2', 'h3', 'h4', 'h5', 'h6', 'small',
        'sup', 'sub', 'center', 'button', 'a', 'u'],
    allowedAttributes: {
        'a': ['href', 'target', 'style'],
        '*': ['id', 'style', 'data-toggle', 'data-target', 'aria-label', 'role', 'class'],
        'img': ['src', 'height', 'width', 'style']
    },
    peerConfig: {
        iceServers: [
            {urls: ['turn:turn.trackauthoritymusic.com:5349'], 'credential': process.env.REACT_APP_TURNPASS, 'username': process.env.REACT_APP_TURNUSER},
            {urls: ['turn:numb.viagenie.ca'], 'credential': 'KD@)*SDL.ms!4ad', 'username': 'eli@taylormadetraffic.com'},
            {urls: [
                    'stun:turn.trackauthoritymusic.com:3478',
                    'stun:stun1.l.google.com:19302',
                    'stun:stun2.l.google.com:19302',
                    'stun:stun.services.mozilla.com'
                ]
            }
        ],
        iceTransportPolicy : "all",
        iceCandidatePoolSize: 10
    }
};

Config.richTags = Config.allowedTags.concat(['figure', 'img', 'video', 'audio', 'iframe']);
Config.richAttributes = {...Config.allowedAttributes};
Config.richAttributes['iframe'] = ['src', 'allowfullscreen', 'frameborder'];

// console.log(Config);

export const fbConfig = {
    apiKey: "AIzaSyAlMzICClI1d0VPAs5zGmyOO6JEUqLQAic",
    authDomain: "democraseeclub.firebaseapp.com",
    databaseURL: "https://democraseeclub.firebaseio.com",
    projectId: "democraseeclub",
    storageBucket: "democraseeclub.appspot.com",
    messagingSenderId: "1051506392090",
    appId: "1:1051506392090:web:721f69ed2b5afde2a4a5a3",
    measurementId: "G-XYVYDC8L1N"
}

export default Config;
