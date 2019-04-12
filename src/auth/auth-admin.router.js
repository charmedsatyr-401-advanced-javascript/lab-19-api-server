'use strict';

const router = require('express').Router();
const auth = require('../auth/middleware.js');
const Roles = require('../auth/roles.schema.js');
const Users = require('../auth/users.schema.js');

router.get('/error', auth('read'), auth('create'), auth('update'), auth('delete'), forceErr);
router.get('/users', auth('read'), auth('create'), auth('update'), auth('delete'), getUsers);
router.post('/roles', auth('read'), auth('create'), auth('update'), auth('delete'), addRole);
router.post('/autopopulate-roles', autoPopulateRoles);
router.post('/autopopulate-users', autoPopulateUsers);

/**
 * Force error handling
 * This is useful for testing the `./src/middleware/500.js` export
 * @function
 * @name forceErr
 * @param req {object} Express request object
 * @param res {object} Express response object
 * @param next {function} Express middleware function
 **/
function forceErr(req, res, next) {
  next('Error!');
}

/**
 * Console.log all `Users`
 * @function
 * @name getUsers
 * @param req {object} Express request object
 * @param res {object} Express response object
 * @param next {function} Express middleware function
 **/
function getUsers(req, res, next) {
  Users.find().then(users => {
    users.forEach(user => {
      console.log(user);
    });
  });
  res.status(200).send('Accessing `/users`...');
}

/**
 * Add a `role` with custom values to the `Roles` collection
 * @function
 * @name addRole
 * @param req {object} Express request object
 * @param res {object} Express response object
 * @param next {function} Express middleware function
 **/
function addRole(req, res, next) {
  const role = new Roles(req.body);
  role
    .save()
    .then(role => {
      res.send(role);
    })
    .catch(next);
}

/**
 * Autopopulate `Roles` collection with standard values
 * @function
 * @name autoPopulateRoles
 * @param req {object} Express request object
 * @param res {object} Express response object
 * @param next {function} Express middleware function
 **/
function autoPopulateRoles(req, res, next) {
  const admin = { role: 'admin', capabilities: ['create', 'read', 'update', 'delete'] };
  const editor = { role: 'editor', capabilities: ['create', 'read', 'update'] };
  const user = { role: 'user', capabilities: ['read'] };

  [user, editor, admin].forEach(role => {
    Roles.findOne({ role: role.role })
      .then(result => {
        if (!result) {
          const r = new Roles(role);
          r.save().then(role => {
            console.log(`'${role.role}' successfully saved!`);
          });
        } else {
          console.log(`Role '${role.role}' already exists...`);
        }
      })
      .catch(console.error);
  });
  res.status(200).send('Populating roles...');
}

/**
 * Autopopulate `Users` collection with dummy testing values
 * @function
 * @name autoPopulateUsers
 * @param req {object} Express request object
 * @param res {object} Express response object
 * @param next {function} Express middleware function
 **/
function autoPopulateUsers(req, res, next) {
  const admin = { username: 'admin', password: 'admin', role: 'admin' };
  const editor = { username: 'editor', password: 'editor', role: 'editor' };
  const user = { username: 'user', password: 'user' };

  [user, editor, admin].forEach(user => {
    Users.findOne({ username: user.username })
      .then(result => {
        if (!result) {
          const u = new Users(user);
          u.save().then(user => {
            console.log(`'${user.username}' successfully saved!`);
          });
        } else {
          console.log(`User '${user.username}' already exists...`);
        }
      })
      .catch(console.error);
  });
  res.status(200).send('Populating users...');
}

module.exports = router;
