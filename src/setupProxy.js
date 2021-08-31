/* eslint-disable */
const { createProxyMiddleware } = require("http-proxy-middleware");

const onError = function (err, req, res) {
    console.log("Something went wrong... Ignoring", err);
};

module.exports = function (app) {
    app.use(
        createProxyMiddleware("/v2", {
            target: "https://localcms.democrasee.club",
            changeOrigin:true,
            onError,
            secure: false
        })
    );
};
