'use strict';

/**
 * Error 500 Middleware
 * @module middleware/error
 **/

// Instantiate Q client
const Q = require('@nmq/q/client');

/**
 * Error 500 handler - Returns a JSON object on a server error
 * Publishes the url and error message as an `error` event to the
 * `database` namespace of the message queue
 * @function
 * @param err {object} Express error object
 * @param req {object} Express request object
 * @param res {object} Express response object
 * @param next {function} Express middleware function
 **/
module.exports = (err, req, res, next) => {
  console.error('__SERVER_ERROR__', err);
  let error = { error: err.message || err };

  const { url } = req;
  Q.publish('database', 'error', { url, error });

  res.statusCode = err.status || 500;
  res.statusMessage = err.statusMessage || 'Server Error';
  res.setHeader('Content-Type', 'application/json');
  res.write(JSON.stringify(error));
  res.end();
};
