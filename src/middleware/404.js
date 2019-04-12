'use strict';

/**
 * Error 404 Middleware
 * @module middleware/404
 */

/**
 * Sends a custom 404 response
 * @function
 * @param req {object} Express request object
 * @param res {object} Express response object
 * @param next {function} Express next function
 */
module.exports = (req, res, next) => {
  const error = { error: 'Resource Not Found' };
  res.statusCode = 404;
  res.statusMessage = 'Not Found';
  res.setHeader('Content-Type', 'application/json');
  res.write(JSON.stringify(error));
  res.end();
};
