'use strict';

// Create a router instance
const router = require('express').Router();

// Import middleware
const auth = require('../auth/middleware.js');
const modelFinder = require('../middleware/model-finder.js');

// Instantiate Q client
const Q = require('@nmq/q/client');

// Dynamically evaluate the model
router.param('model', modelFinder);

// Declare routes
router.get('/', home);
router.get(`/api/v1/:model`, getRecords);
router.get(`/api/v1/:model/:id`, getRecords);
router.post(`/api/v1/:model`, auth('create'), createRecord);
router.put(`/api/v1/:model/:id`, auth('update'), updateRecord);
router.patch(`/api/v1/:model/:id`, auth('update'), patchRecord);
router.delete(`/api/v1/:model/:id`, auth('delete'), deleteRecord);

/**
 * Display a home page
 * Publish the request `url` as a `read` event to the
 * `database` namespace of the message queue
 * @function
 * @name home
 * @param req {object} Express request object
 * @param res {object} Express response object
 * @param next {function} Express middleware function
 **/
function home(req, res, next) {
  const { url } = req;
  Q.publish('database', 'read', { url });
  res.status(200).send('Welcome to the home page!');
}

/**
 * Get all or one record
 * Publish the request `url` and `id` parameter as a `read`
 * event to the `database` namespace of the message queue
 * @function
 * @name getAll
 * @param req {object} Express request object
 * @param res {object} Express response object
 * @param next {function} Express middleware function
 **/
function getRecords(req, res, next) {
  const { url } = req;
  const { id } = req.params;
  Q.publish('database', 'read', { id: id || null, url });
  req.model
    .get(id)
    .then(results => res.status(200).send(results))
    .catch(next);
}

/**
 * Create a new record
 * Publish the request `url` and `body` as a `create` event
 * to the `database` namespace of the message queue
 * @function
 * @name createRecord
 * @param req {object} Express request object
 * @param res {object} Express response object
 * @param next {function} Express middleware function
 **/
function createRecord(req, res, next) {
  const { body, url } = req;
  Q.publish('database', 'create', { body, url });
  req.model
    .post(body)
    .then(result => res.status(200).send(result))
    .catch(next);
}

/**
 * Update a record - upserts if the record does not exist
 * Publish the request `url`, `body`, and `id` parameter as
 * an `update` event to the `database` namespace of the
 * message queue
 * @function
 * @name updateRecord
 * @param req {object} Express request object
 * @param res {object} Express response object
 * @param next {function} Express middleware function
 **/
function updateRecord(req, res, next) {
  const { url, body } = req;
  const { id } = req.params;
  Q.publish('database', 'update', { url, body, id });
  req.model
    .put(id, body)
    .then(result => res.status(200).send(result))
    .catch(next);
}

/**
 * Patch a new record - does not upsert
 * Update a record - upserts if the record does not exist
 * Publish the request `url`, `body`, and `id` parameter as
 * an `update` event to the `database` namespace of the
 * message queue
 * @function
 * @name patchRecord
 * @param req {object} Express request object
 * @param res {object} Express response object
 * @param next {function} Express middleware function
 **/
function patchRecord(req, res, next) {
  const { url, body } = req;
  const { id } = req.params;
  Q.publish('database', 'update', { url, body, id });
  req.model
    .patch(id, body)
    .then(result => res.status(200).send(result))
    .catch(next);
}

/**
 * Delete a record
 * Publish the request `url` and `id` parameter as
 * a `delete` event to the `database` namespace of the
 * message queue
 * @function
 * @name deleteRecord
 * @param req {object} Express request object
 * @param res {object} Express response object
 * @param next {function} Express middleware function
 **/
function deleteRecord(req, res, next) {
  const { url } = req;
  const { id } = req.params;
  Q.publish('database', 'delete', { id, url });
  req.model
    .delete(id)
    .then(result => res.status(200).send(result))
    .catch(next);
}

module.exports = router;
