/* eslint-disable */
const { createProxyMiddleware } = require("http-proxy-middleware");

const onError = function (err, req, res) {
    console.log("Something went wrong... Ignoring", err);
};

module.exports = function (app) {
    app.use(
        createProxyMiddleware("/v2", {
            target: process.env.REACT_APP_JSONAPI_CDN,
            changeOrigin:true,
            onError,
            secure: false
        })
    );
};
