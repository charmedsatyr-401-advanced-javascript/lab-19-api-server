'use strict';

/**
 * Error 404 Middleware
 * @module middleware/404
 */

// Instantiate Q client
const Q = require('@nmq/q/client');

/**
 * Sends a custom 404 response
 * Publishes the url as an `error` event to the
 * `database` namespace of the message queue
 * @function
 * @param req {object} Express request object
 * @param res {object} Express response object
 * @param next {function} Express next function
 */
module.exports = (req, res, next) => {
  const error = { error: 'Resource Not Found' };

  const { url } = req;
  Q.publish('database', 'error', { url });

  res.statusCode = 404;
  res.statusMessage = 'Not Found';
  res.setHeader('Content-Type', 'application/json');
  res.write(JSON.stringify(error));
  res.end();
};
