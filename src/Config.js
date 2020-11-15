const Config = {
    api: {
        base: process.env.REACT_APP_API_URL, // set in .env
        client : process.env.NODE_ENV === 'production' ?  'https://democraseeclub.web.app' : '//localhost:3000'
    },
    allowedTags: ['blockquote', 'p', 'ul', 'li', 'ol', 'dl', 'dd', 'dt', // https://www.npmjs.com/package/sanitize-html
        'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
        'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'h2', 'h3', 'h4', 'h5', 'h6',
        'sup', 'sub', 'center', 'button', 'a'],
    allowedAttributes: {
        'a': ['href', 'target'],
        '*': ['id', 'style', 'data-toggle', 'data-target', 'aria-label', 'role', 'class'],
        'img': ['src', 'height', 'width']
    },
};
export default Config;
