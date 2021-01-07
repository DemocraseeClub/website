import axios from 'axios';

class RemoteAPI {

    constructor() {
      this.requester = axios.create();
      // WARN: https://github.com/axios/axios/issues/385
        // axios.defaults.headers.common['crossDomain'] = true;
        // axios.defaults.headers.common['async'] = true;
        // axios.defaults.headers.common['timeout'] = process.env.NODE_ENV === 'production' ? 30000 : 0; // for debugging with php breakpoints
        axios.defaults.headers.common['Accept'] = 'application/json';
        //axios.defaults.headers.common['Access-Control-Max-Age'] = 6000;
        axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    Get (path, config) {
        console.log('Get remote '+path);
        return this.requester.get(path, config);
    }

    getErrorMsg(err) {
      if (typeof err.message === 'string') { // or stack?
        console.log('Error', err.message);
        return err.message;
      } else if (err.response && err.response.data) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(err.response.data);
          console.log(err.response.status);
          if (err.response.data.error) {
            return err.response.data.error;
          }
          if (typeof err.response.data.message === 'string') return err.response.data.message;
          return err.response.data;
        } else if (err.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(err.request);
          return 'no server response received';
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Uknown error', err);
          return 'Unknown error';
        }
    }

}

export default new RemoteAPI(); // singleton
