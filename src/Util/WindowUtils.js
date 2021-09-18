export function getParam(name, url, d) {
    if (d === undefined) d = '';
    if (!url) url = document.location.search;
    if (url.indexOf('?') > -1) url = url.slice(url.indexOf('?') + 1);
    if (url.indexOf('#') === 0) url = url.slice(1);
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


const segmentMap = {
    users: "aid",
    rallies: "rid",
    publications: "pid",
    meetings: "mid",
    comments: "cid",
};

export function getIdbySegment(url) {
    const tdata = {};
    let parts = url.split("/");
    Object.entries(segmentMap).forEach(([segName, param]) => {
        let index = parts.indexOf(segName);
        if (index > 0 && parseInt(parts[index + 1]) > 0) {
            tdata[param] = parseInt(parts[index + 1]);
        }
    });
    tdata.bundle = parts
        .reverse()
        .find(
            (e) =>
                !parseInt(e) &&
                e !== "delete" &&
                e !== "add" &&
                e !== "edit" &&
                e !== ""
        );
    if (!tdata.bundle) delete tdata.bundle;
    return tdata;
}

export const formatSeconds = (sec, len) => {
    if (!Number(sec)) sec = 0;
    let date = new Date(null);
    date.setSeconds(sec); // specify value of SECONDS
    let time = date.toISOString().substr(11, 8);
    if (time.indexOf('01:00:00') === 0) return '60:00';
    if (time.indexOf('00:') === 0) time = time.substr('00:'.length);
    return time;
}
