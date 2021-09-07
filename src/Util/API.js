import axios from 'axios';
import Config from '../Config';

class API {

    constructor() {
      this.requester = axios.create({
          baseURL: process.env.NODE_ENV === 'production' ? process.env.REACT_APP_JSONAPI_URL : '/v2',
          timeout: process.env.NODE_ENV === 'production' ? 30000 : 0,
          params: {
//              '_format': 'json',
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
      let msg = [];
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
