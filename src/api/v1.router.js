'use strict';

// Create a router instance
const router = require('express').Router();

// Import middleware
const auth = require('../auth/middleware.js');
const modelFinder = require('../middleware/model-finder.js');

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
 * @function
 * @name home
 * @param req {object} Express request object
 * @param res {object} Express response object
 * @param next {function} Express middleware function
 **/
function home(req, res, next) {
  res.status(200).send('Welcome to the home page!');
}

/**
 * Get all or one record
 * @function
 * @name getAll
 * @param req {object} Express request object
 * @param res {object} Express response object
 * @param next {function} Express middleware function
 **/
function getRecords(req, res, next) {
  const { id } = req.params;
  req.model
    .get(id)
    .then(results => res.status(200).send(results))
    .catch(next);
}

/**
 * Create a new record
 * @function
 * @name createRecord
 * @param req {object} Express request object
 * @param res {object} Express response object
 * @param next {function} Express middleware function
 **/
function createRecord(req, res, next) {
  const { body } = req;
  req.model
    .post(body)
    .then(result => res.status(200).send(result))
    .catch(next);
}

/**
 * Update a record - upserts if the record does not exist
 * @function
 * @name updateRecord
 * @param req {object} Express request object
 * @param res {object} Express response object
 * @param next {function} Express middleware function
 **/
function updateRecord(req, res, next) {
  const { id } = req.params;
  const { body } = req;
  req.model
    .put(id, body)
    .then(result => res.status(200).send(result))
    .catch(next);
}

/**
 * Patch a new record - does not upsert
 * @function
 * @name patchRecord
 * @param req {object} Express request object
 * @param res {object} Express response object
 * @param next {function} Express middleware function
 **/
function patchRecord(req, res, next) {
  const { id } = req.params;
  const { body } = req;
  req.model
    .patch(id, body)
    .then(result => res.status(200).send(result))
    .catch(next);
}

/**
 * Delete a record
 * @function
 * @name deleteRecord
 * @param req {object} Express request object
 * @param res {object} Express response object
 * @param next {function} Express middleware function
 **/
function deleteRecord(req, res, next) {
  const { id } = req.params;
  req.model
    .delete(id)
    .then(result => res.status(200).send(result))
    .catch(next);
}

module.exports = router;
