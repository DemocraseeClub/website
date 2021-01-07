/* eslint no-console: 0 */
/* eslint no-useless-constructor: 0 */


class Logger {
    constructor () {
        // TODO: Send logs to server?
    }

    Clear () {
        console.clear();
    }

    Info (path, log) {
        console.log('[INFO][' + path + '] ' + log);
    }

    Error (path, log) {
        console.error('[ERROR][' + path + '] ' + log);
    }

    Object (obj) {
        console.log(obj);
    }
}

export default (new Logger());
