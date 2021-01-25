export function getParam(name, url, d) {
    if (!d && typeof d !== 'number') d = '';
    if (!url) url = document.location.search;
    if (url.indexOf('?') > -1) url = url.slice(url.indexOf('?') + 1);
    let parts = url.split('&');
    let vals =  [];
    parts.forEach(e => {
        let param = e.split("=");
        if (param[0] === name) vals.push(param[1]);
    });
    if (vals.length === 0) return d;
    if (vals.length === 1) return vals[0];
    return vals;
};

export const formatSeconds = (sec, len) => {
    if (!Number(sec)) sec = 0;
    let date = new Date(null);
    date.setSeconds(sec); // specify value of SECONDS
    let time = date.toISOString().substr(11, 8);
    if (time.indexOf('01:00:00') === 0) return '60:00';
    if (time.indexOf('00:') === 0) time = time.substr('00:'.length);
    return time;
}
