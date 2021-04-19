import Config from '../Config';
//import oauth2 from 'simple-oauth2';
var ClientOAuth2 = require('client-oauth2');


class OAuther {

  constructor() {
    this.requester = this.buildClientRequester();
  }

  buildClientRequester(scopes) {
    let credentials = {
        clientId: Config.api.client_id,
        clientSecret: Config.api.client_secret,
        accessTokenUri: Config.api.base + '/oauth/token',
        authorizationUri: Config.api.base + '/oauth/authorize',
        redirectUri: Config.api.base + '/oauth2/callback',
    };
    if (scopes) {
      credentials.scopes = scopes;  // also can be an array of multiple scopes, ex. ['<scope1>, '<scope2>', '...']
    }
    return new ClientOAuth2(credentials);
  }

  buildRequester() {
    const credentials = {
      client: {
        id: Config.api.client_id,
        secret: Config.api.client_secret,
        secretParamName : 'client_secret',
        idParamName : 'client_id',
        authorizePath : '/oauth/authorize', // defaults to /oauth/authorize
        //redirect_uri: Config.api.base + '/oauth2/callback',
      },
      auth: {
        tokenHost: Config.api.base
      },
//      options : {
//        authorizationMethod :'body'
//      }
    };
    // return require('simple-oauth2').create(credentials);
    //return oauth2.create(credentials);
  }

  getClientToken(username, password, scopes) {
    const tokenConfig = {
      username: username,
      password: password
      , client_id : Config.api.client_id
      , client_secret : Config.api.client_secret
    };
    if (scopes) {
      tokenConfig.scope = scopes;  // also can be an array of multiple scopes, ex. ['<scope1>, '<scope2>', '...']
    }

    this.requester.owner.getToken(username, password)
      .then(function (user) {
        console.log(user) //=> { accessToken: '...', tokenType: 'bearer', ... }
      })

  }

  async getToken(username, password, scopes) {
    // Get the access token object.
    const tokenConfig = {
      username: username,
      password: password
      , client_id : Config.api.client_id
      , client_secret : Config.api.client_secret
    };
    if (scopes) {
      tokenConfig.scope = scopes;  // also can be an array of multiple scopes, ex. ['<scope1>, '<scope2>', '...']
    }

    // Save the access token
    var res = {};
    try {
      const result = await this.requester.ownerPassword(tokenConfig);
      const accessToken = this.requester.accessToken.create(result);
      res = result;
    } catch (error) {
      res = error.message;
      console.log('Access Token Error', error.message);
    }
    return res;

  }
}

export default (new OAuther());
