'use strict';

/**
 * users model - a mongoose schema with custom methods as validation helpers
 * @module auth/users.model
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('./roles.schema.js');

// A set of used single-used tokens
const usedTokens = new Set();

// The base `users` schema is prepared to display virtual joins
const users = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String },
    role: { type: String, default: 'user', enum: ['admin', 'editor', 'user'] },
  },
  { toObject: { virtuals: true }, toJSON: { virtuals: true } }
);

/**
 * Create a virtual `column` on `users` that corresponds to the values of
 * that user's role's `capabilities` in the `roles` schema
 **/
users.virtual('capabilities', {
  ref: 'roles',
  localField: 'role',
  foreignField: 'role',
  justOne: false,
});

/**
 * These `users.pre` hooks ensure users have `capabilities` whenever
 * the `user` is accessed.
 */
users.pre('find', function() {
  try {
    this.populate('capabilities');
  } catch (err) {
    console.error(err);
  }
});

users.pre('findOne', function() {
  try {
    this.populate('capabilities');
  } catch (err) {
    console.error(err);
  }
});

users.pre('findById', function() {
  try {
    this.populate('capabilities');
  } catch (err) {
    console.error(err);
  }
});

users.pre('save', function() {
  try {
    this.populate('capabilities');
  } catch (err) {
    console.error(err);
  }
});

/**
 * A pre-save hook for the `users` object that
 * hashes passwords with `bcrypt` before they
 * are saved to the database.
 * @function
 * @name users.pre
 * @param next {function} Express middleware function
 */
users.pre('save', function(next) {
  bcrypt
    .hash(this.password, 10)
    .then(hashedPassword => {
      this.password = hashedPassword;
      next();
    })
    .catch(error => {
      throw error;
    });
});

/**
 * A static class method that queries the database for a user
 * and authenticates their password using the `bcrypt`-based
 * `comparePassword` method.
 * @function
 * @name authenticateBasic
 * @param auth {object} Receives the `user` object
 */
users.statics.authenticateBasic = function(auth) {
  const query = { username: auth.username };
  return this.findOne(query)
    .then(user => user && user.comparePassword(auth.password))
    .catch(console.error);
};

/**
 * Compare a plain text password against the hashed one we have saved
 * @function
 * @name comparePassword
 * @param password {string} The password submitted from the client
 **/
users.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password).then(valid => (valid ? this : null));
};

/**
 * This function supports single-use tokens, tokens with an expiration
 * time, and permanent access keys.
 * @function
 * @name authenticateToken
 * @param token {string} The user's authentication token
 */
users.statics.authenticateToken = function(token) {
  console.log('Authenticating Token:', token);
  if (usedTokens.has(token)) {
    return Promise.reject('Invalid Token');
  }

  try {
    const parsedToken = jwt.verify(token, process.env.SECRET);
    process.env.SINGLE_USE_TOKENS && parsedToken.type !== 'key' && usedTokens.add(token);
    const query = { _id: parsedToken.id };
    return this.findOne(query);
  } catch (err) {
    throw new Error('Invalid Token');
  }
};

/**
 * Use the user's email from their chosen OAuth service
 * to create a new user in the database.
 * This currently returns an error if the user's email is not available.
 * @function
 * @name createFromOauth
 * @param email {string} The user's email address
 */
users.statics.createFromOauth = function(email) {
  if (!email) {
    return Promise.reject('Validation Error');
  }
  return (
    this.findOne({ email })
      .then(user => {
        if (!user) {
          throw new Error('User Not Found');
        }
        return user;
      })
      // eslint-disable-next-line no-unused-vars
      .catch(error => {
        let username = email;
        let password = 'none';
        return this.create({ username, password, email });
      })
  );
};

/**
 * Generate a JWT from the user id and a secret
 * @function
 * @name generateToken
 * @param type {string} Specify a type of token to generate
 **/
users.methods.generateToken = function(type) {
  const tokenData = {
    id: this._id,
    capabilities:
      (this.capabilities && this.capabilities.capabilities) ||
      (this.capabilities && this.capabilities[0] && this.capabilities[0].capabilities) ||
      [],
    type: type || 'user',
  };
  const options = {};
  if (type !== 'key' && !!process.env.TOKEN_EXPIRE) {
    options.expiresIn = process.env.TOKEN_EXPIRE;
  }
  return jwt.sign(tokenData, process.env.SECRET, options);
};

/**
 * Calls the `generateToken` method with the argument `key`
 * and returns the result.
 * @function
 * @name generateKey
 */
users.methods.generateKey = function() {
  return this.generateToken('key');
};

/**
 * Check the user's capabilities to determine if they are authorized
 * @function
 * @name can
 * @param capability {string} The capability required for authorization
 */
users.methods.can = function(capability) {
  const capabilities = this.capabilities.capabilities || this.capabilities[0].capabilities;
  return capabilities.includes(capability);
};

module.exports = mongoose.model('users', users);
