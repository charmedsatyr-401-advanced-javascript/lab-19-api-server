'use strict';

/**
 * Authentication router module - Allows signup (user creation) and signin authentication
 * @module auth/router
 */

const express = require('express');
const authRouter = express.Router();

const User = require('./users.schema.js');
const auth = require('./middleware.js');
// const oauth = require('./oauth/google.js');

// Routes
authRouter.post('/signup', signup);
authRouter.post('/signin', auth(), signin);
// authRouter.post('/oauth', oauth);
authRouter.post('/key', auth(), key);

/**
 * @function
 * @name /signup POST route handler
 * @param req {object} Express request object
 * @param res {object} Express response object
 * @param next {function} Express middleware function
 */
function signup(req, res, next) {
  const user = new User(req.body);
  user
    .save()
    .then(user => {
      User.findOne({ _id: user._id }).then(user => {
        console.log('USER', user);
        req.token = user.generateToken();
        req.user = user;
        res.set('token', req.token);
        res.cookie('auth', req.token);
        res.send(req.token);
      });
    })
    .catch(next);
}

/**
 * @function
 * @name /signin POST route handler
 * @param req {object} Express request object
 * @param res {object} Express response object
 * @param next {function} Express middleware function
 */
function signin(req, res, next) {
  res.cookie('auth', req.token);
  res.send(req.token);
}

/**
 * *UNTESTED*
 * Used when signing in via Google
 * @function
 * @name /signin POST route handler
 * @param req {object} Express request object
 * @param res {object} Express response object
 * @param next {function} Express middleware function
 */
/*
function oauth(req, res, next) {
  oauth
    .authorize(req)
    .then(token => {
      res.status(200).send(token);
    })
    .catch(next);
}

/**
 * Used to generate a permanent access key
 * @function
 * @name /signin POST route handler
 * @param req {object} Express request object
 * @param res {object} Express response object
 * @param next {function} Express middleware function
 */
function key(req, res, next) {
  const key = req.user.generateKey();
  res.status(200).send(key);
}

module.exports = authRouter;
