'use strict';

/**
 * Error 500 Middleware
 * @module middleware/error
 **/

/**
 * Error 500 handler - Returns a JSON object on a server error
 * @function
 * @param err {object} Express error object
 * @param req {object} Express request object
 * @param res {object} Express response object
 * @param next {function} Express middleware function
 **/
module.exports = (err, req, res, next) => {
  console.error('__SERVER_ERROR__', err);
  let error = { error: err.message || err };
  res.statusCode = err.status || 500;
  res.statusMessage = err.statusMessage || 'Server Error';
  res.setHeader('Content-Type', 'application/json');
  res.write(JSON.stringify(error));
  res.end();
};
