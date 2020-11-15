import axios from 'axios';
import Config from '../Config';

class API {

    constructor() {
      this.callqueue = [];
      this.requester = axios.create({
          baseURL: Config.api.base,
          timeout: process.env.NODE_ENV === 'production' ? 30000 : 0,
          params: {
              '_format': 'json',
//              '_xhprof':1
//            ,'XDEBUG_SESSION_START': 'xdebug-atom'
          }
      });
       // WARN: https://github.com/axios/axios/issues/385!
        // this.requester.defaults.headers.common['crossDomain'] = true;
        // this.requester.defaults.headers.common['async'] = true;
        // this.requester.defaults.headers.common['timeout'] = process.env.NODE_ENV === 'production' ? 30000 : 0; // for debugging with php breakpoints
        this.requester.defaults.headers.common['Accept'] = 'application/json';
        //this.requester.defaults.headers.common['Access-Control-Max-Age'] = 6000;
        this.requester.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
        //this.requester.defaults.headers.post['Content-Type'] = 'multipart/form-data';


      var that = this;
      this.requester.interceptors.request.use(function (config) {
        that.callqueue.push(config); // TODO: key be config.url
        var tokens = that.getLocalTokens();
        if (config.url.indexOf('/oauth/token') === 0) {
          // config.headers.common['Authorization'] = 'Basic ' + Config.api.base64d;
        } else if (tokens && tokens.access_token) {
          //console.log('ADDING BEARER TOKEN');
          config.headers.common['Authorization'] = 'Bearer ' + tokens.access_token;
        }
        return config;
      }, function(error) {
        console.log('ERROR ON INTERCEPTOR REQUEST', error);
        return Promise.reject(error);
      });

      this.requester.interceptors.response.use(res => {
        if (res.data.apiversion) {
          var appversion = localStorage.getItem(Config.api.tokName + '_apiversion');
          if (appversion && parseInt(appversion) < parseInt(res.data.apiversion)) {
            if (res.config.url.indexOf(Config.api.base + '/appstartup') === 0) { // on initial load and any form submissions that require menu updates
              // localStorage.setItem(Config.api.tokName + '_apiversion', (res.data.apiversion) ? res.data.apiversion : Math.floor(new Date().getTime()/1000));
            } else {
              localStorage.setItem(Config.api.tokName + '_apiversion', res.data.apiversion); // or else this will repeat every request
              if (window.confirm("We've launched some breaking changes. Do you want to reload the latest page?")) {
                document.location.reload();
              }
            }
          }
        }
        that.callqueue.shift(); // WARN: this could be removed out of order (we probably should)
        return res;
      }, error => { // error might be old access_token
        const statusCodes = {401:false,403:false};
        if (error.response && typeof statusCodes[error.response.status] !== 'undefined') {
          if (error.response.config.url === Config.api.base + '/oauth/token') {
            that.callqueue.shift(); // remove and reject
            console.log("Removed the interceptor to prevent a loop  in case token refresh also causes the 401");
          } else if (error.response.config.url === Config.api.base + '/appstartup') {
            localStorage.removeItem(Config.api.tokName);
            document.location.href = '/login';
          } else {
            console.log("Maybe your token expired? Refresh the page to update.");
          }
          return Promise.reject(error);
        }
        that.callqueue.shift();
        return Promise.reject(error); // remove and run next
      });
    }

    createAuthRefreshInterceptor (axInstance, refreshTokenCall, options = {}) {
        const id = axInstance.interceptors.response.use(res => res, error => {
            console.log("createAuthRefreshInterceptor");
            // Reject promise if the error status is not in options.ports or defaults.ports
            const statusCodes = options.statusCodes;
            if (!error.response || (error.response.status && statusCodes.indexOf(+error.response.status) === -1)) {
                return Promise.reject(error);
            }

            if (error.response.config.url === Config.api.base + '/oauth/token') {
              console.log("Remove the interceptor to prevent a loop in case token refresh also causes the 401");
            }
            axInstance.interceptors.response.eject(id);

            const refreshCall = refreshTokenCall(error);

            // Create interceptor that will bind all the others requests until refreshTokenCall is resolved
            const requestQueueInterceptorId = axInstance.interceptors.request
                .use(
                  request => // user initiated
                  refreshCall.then((e) => // refresh if 401/403
                  request // user initiated
                ));

            // When response code is 401 (Unauthorized), try to refresh the token.
            return refreshCall.then((e) => {
                axInstance.interceptors.request.eject(requestQueueInterceptorId);
                return axInstance(error.response.config);
            }).catch(error => {
                axInstance.interceptors.request.eject(requestQueueInterceptorId);
                return Promise.reject(error)
            }).finally((e) =>
              this.createAuthRefreshInterceptor.call(this, axInstance, refreshTokenCall, options)
          );
        });
        return axInstance;
    }

    refreshToken(err) {
      // @TODO if not a secured page >  return Promise.resolve();
      console.log('getting token ' + Config.api.tokName);
      let tokens = localStorage.getItem(Config.api.tokName);
      try {
        tokens = JSON.parse(tokens);
        if (tokens === null || typeof tokens.access_token !== 'string') tokens = false;
      } catch(e) {
        tokens = false;
      }
      if (!tokens || !tokens.refresh_token) {
        console.log("nothing to refresh");
        return Promise.resolve();
      }
      if (typeof tokens.refresh_error === 'string') {
        console.log("force new login??");
        return Promise.resolve();
      }

      var formData = new FormData();
      formData.append('grant_type', 'refresh_token');
      formData.append('refresh_token', tokens.refresh_token);
      formData.append('client_id', Config.api.client_id);
      formData.append('client_secret', Config.api.client_secret);

      var req = {
         url: Config.api.base + "/oauth/token", method: "POST",
         headers : {'Content-Type': `multipart/form-data; boundary=` + formData._boundary},
         data : formData,
       }
       const that = this;

       //this.requester.request(req).then(res => { // send with new axios instance, not as part of this.requester
       return axios.request(req).then(res => { // send with new axios instance, not as part of this.requester

           console.log("REFRESHED TOKENS", res.data);
           tokens.refresh_token = res.data.refresh_token;
           tokens.access_token = res.data.access_token;
           tokens.expires_in = res.data.expires_in;
           tokens.created_time = new Date().getTime();

           localStorage.setItem(Config.api.tokName, JSON.stringify(tokens));

           if (that.callqueue.length > 0) {
              var config = that.callqueue.shift(); // remove last
              config.headers.Authorization = 'Bearer ' + tokens.access_token;
              console.log("RESOLVE ORIGINAL REQUEST", config);
              // return that.requester.request(config); // this complete doesn't fire the onSucess callback for this request
              return Promise.resolve(config);
           }
           console.log("RESOLVING REFRESH POST");
           return Promise.resolve(config);


       }).catch(err2 => {
          var msg = that.getErrorMsg(err2);
          console.log(msg);
          tokens.refresh_error = msg;
          localStorage.setItem(Config.api.tokName, JSON.stringify(tokens));
          if (document.location.pathname !== '/login') {
            document.location.href = '/login?reload=' + new Date().getTime();
          }
          console.log("REJECTING REFRESH POST");
          return Promise.reject(err2);
       });
    }

    getLocalTokens() {
      let tokens = localStorage.getItem(Config.api.tokName);
      // console.log('getLocalToken ' + Config.api.tokName, tokens);
      if (!tokens || tokens === '') return false;
      try {
        tokens = JSON.parse(tokens);
        if (tokens === null || typeof tokens.access_token !== 'string') tokens = false;
      } catch(e) {
        tokens = false;
      }
      return tokens;
    }

    Get (path) {
        // console.log('Get to '+path);
        return this.requester.get(path);
    }

    Put (path, data) {
        // console.log('Put to '+path+' with', data);
        return this.requester.put(path, data);
    }

    Delete (path, data) {
        // console.log('Delete to '+path+' with', data);
        return this.requester.delete(path, data);
    }

    Post (path, data) {
        // console.log('POST to "' + path + '" with ', data);
        return this.requester.post(path, data);
    }

    Request (req) {
        // console.log('API', req.method + ' to "' + req.url + '"');
        return this.requester.request(req);
    }

    Html(path) {
      axios.defaults.headers.common['Accept'] = 'text/html';
      var html = this.requester.get(path);
      axios.defaults.headers.common['Accept'] = 'application/json';
      return html;
    }

    checkError(res) {
      if (typeof res.message !== 'undefined') {
        return res.message;
      } else if (res.error) {
        if (typeof res.error === 'object') return res.error.join('. ');
        return res.error;
      }
      return '';
    }

    getErrorMsg(err) {
      var msg = [];
      if (err.response && err.response.data) {
          console.log(err.response.status, err.response.data);
          if (typeof err.response.data.message === 'string') {
            msg.push( err.response.data.message === '' ? 'Unauthorized' : err.response.data.message );
          } else if (err.response.data.error) {
            if (typeof err.response.data.error === 'object') msg.push(err.response.data.error.join(', '));
            else msg.push(err.response.data.error);
          } else if (err.response.data.indexOf('<!DOCTYPE html>') !== 0) {
            // msg.push(err.response.data);
          }
      }

      if (msg.length === 0) {
        if (typeof err.message !== 'undefined' && err.message !== '') {
          console.log('Error', err.message);
          msg.push(err.message);
        } else if (err.request) {
          console.log(err.request);
          msg.push('no server response from server: ' + Config.api.base);
        } else {
          msg.push(JSON.stringify(err));
          console.log('Default Server Error', err);
        }
      }

      return msg.join('. ');
    }

}

export default new API(); // singleton
