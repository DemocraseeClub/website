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
