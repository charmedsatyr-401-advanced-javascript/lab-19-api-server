'use strict';

/**
 * Authentication middleware module
 * @module auth/middleware
 */

// Import the mongoose user model
const User = require('./users.schema.js');

/**
 * Parses authorization headers and uses internal methods to validate user.
 * Curried to set a `capability` and return a function that takes router arguments
 * @function
 * @name authentication middleware
 * @param capability {string} A role capability required for route access
 */
module.exports = capability => {
  /**
   * @param req {object} Express request object
   * @param res {object} Express response object
   * @param next {function} Express middleware function
   **/
  return (req, res, next) => {
    try {
      let [authType, authString] = req.headers.authorization.split(/\s+/);

      switch (authType.toLowerCase()) {
        case 'basic':
          return _authBasic(authString);
        case 'bearer':
          return _authBearer(authString);
        default:
          return _authError();
      }
    } catch (e) {
      _authError();
    }

    /**
     * Parses authentication header and passes it into a user model method `authenticateBasic`
     * @function
     * @name _authBasic
     * @param authString {string} Base64 encoding of the `id` and `password` joined by a colon.
     */
    function _authBasic(authString) {
      // str: am9objpqb2hubnk=
      const base64Buffer = Buffer.from(authString, 'base64'); // <Buffer 01 02 ...>
      const bufferString = base64Buffer.toString(); // john:mysecret
      const [username, password] = bufferString.split(':'); // john='john'; mysecret='mysecret'
      const auth = { username, password }; // { username:'john', password:'mysecret'  }

      return User.authenticateBasic(auth)
        .then(user => {
          return _authenticate(user);
        })
        .catch(_authError);
    }

    /**
     * @function
     * @name _authBearer
     * @param authString {string} The Bearer authentication token received in the Authorization header
     **/
    function _authBearer(authString) {
      return User.authenticateToken(authString)
        .then(user => _authenticate(user))
        .catch(_authError);
    }

    /**
     * Attaches `user` object and authentication token to the request object.
     * @function
     * @name _authenticate
     * @param user {object} The `user` object validated by `bcrypt`
     */
    function _authenticate(user) {
      if (user && (!capability || user.can(capability))) {
        req.user = user;
        req.token = user.generateToken();
        next();
      } else {
        _authError();
      }
    }

    /**
     * Calls the `next` middleware with an error object.
     * @function
     * @name _authError
     */
    function _authError() {
      next('Invalid User ID/Password');
    }
  };
};
