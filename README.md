![CF](http://i.imgur.com/7v5ASc8.png) LAB
=================================================

## Lab 19: API Server with Message Queue

### Author: Joseph Wolfe

### Links and Resources
* [repo](https://github.com/charmedsatyr-401-advanced-javascript/lab-19-api-server)
* [![Build Status](https://travis-ci.org/charmedsatyr-401-advanced-javascript/lab-19-api-server.svg?branch=submission)](https://travis-ci.org/charmedsatyr-401-advanced-javascript/lab-19-api-server)

#### Documentation
* [swagger] Not deployed
* [jsdoc](./docs/)

### Modules
`./index.js`

`./src/server.js`

`./src/api/v1-admin.router.js`

`./src/api/v1.router.js`

`./src/auth/oauth/*`

`./src/auth/auth-admin.router.js`

`./src/auth/auth.router.js`

`./src/auth/middleware.js`

`./src/auth/roles.schema.js`

`./src/auth/users.schema.js`

`./src/middleware/404.js`

`./src/middleware/500.js`

`./src/middleware/method-override.js`

`./src/middleware/model-finder.js`

`./src/models/model.model.js`

`./src/models/books/books.model.js`

`./src/models/books/books.schema.js`

-----

#### `./index.js`
##### Exported Values and Methods
This is the entry point of the application. When the app starts, the database connections are initiated.

-----

#### `.src/server.js`
##### Exported Values and Methods from `./src/server.js`
This module instantiates the app, sets middleware, routes, and controllers, and exports a `server` and `start` method for the Express server.

-----

#### `.src/api/v1-admin.router.js`
##### Exported Values and Methods
This module is under development and is intended for testing purposes. It exports an Express `router` with a single endpoint:

* `POST`
  * `/api/v1/:model/random` → Generates a random `model` record using the `faker` package. Publishes the request `url` and generated record to the Q `database` namespace.

Currently, the generated record follows the schema of a `Book`, per `./src/models/books/books.schema.js`. However, it should be possible to improve this implementation by requiring a static `generateRandomRecord` method on each model or by dynamically assessing schema requirements before randomization.

-----
#### `.src/api/v1.router.js`
##### Exported Values and Methods
This module exports an Express `router` with dynamic endpoints that correspond to the `model` instance determined by the `modelFinder` module from `./src/middleware/model-finder.js`. Most routes (except `/`) invoke a REST method that manipulates the `model`'s class methods using the data provided to the endpoint in the request as arguments.

* `GET`
  * `/` → Returns a short welcome message. Publishes the request `url` in a `read` event to the `database` namespace of the  message queue.

  * `/api/v1/:model` → Returns all `model` records from the database. Publishes the request `url` and an `id` key with the value of `null` in a `read` event  to the `database` namespace of the message queue.

  * `/api/v1/:model/:id` → Returns a `model` record from the database that has the given `id`; expects an `id` parameter. Publishes the request `url` and `id` parameter in a `read` event to the `database` namespace of the message queue.

* `POST`
  * `/api/v1/:model` → Creates a new `model` record in the database; expects a JSON object corresponding to the `model` schema in the request `body`. This route requires the `create` capability. Publishes the request `url` and body in a `create` event to the `database` namespace of the message queue.

* `PUT`
  * `/api/v1/:model/:id` → Modifies a `model` record in the database; expects an `id` parameter and a JSON object corresponding to the `model` schema in the request `body`. If a record with that `id` does not exist, one is created. This route requires the `update` capability. Publishes the request `url`, `id` parameter, and body in an `update` event to the `database` namespace of the message queue.

* `PATCH`
  * `/api/v1/:model/:id` → Modifies a `model` record in the database; expects an `id` parameter and a JSON object corresponding to the `model` schema in the request `body`. No new records will be created. This route requires the `update` capability. Publishes the request `url`, `id` parameter, and body in an `update` event to the `database` namespace of the message queue.

* `DELETE`
  * `/api/v1/:model/:id` → Deletes a `model` record in the database that has the given `id`; expects an `id` parameter. This route requires the `delete` capability. Publishes the request `url` and `id` parameter to in a `delete` event to the `database` namespace of the message queue.

-----

#### `./src/auth/oauth/*`
Not fully implemented or connected with the rest of the application.

-----

#### `.src/auth/auth-admin.router.js`
##### Exported Values and Methods
This module is under development and is intended for system administrators and testing purposes. It exports an Express `router` with multiple endpoints.

* `GET`
  * `/error` → This route forces a server error and is used for testing.

  * `/users` → This route logs all user data in the server console.

* `POST`
  * `/roles` → This route accepts a JSON object corresponding to the `Roles` schema in `./src/auth/roles.schema.js` in the request `body`. It adds a corresponding `role` to the database and returns the record.  This route requires `read`, `create`, `update`, and `delete` capabilities.

  * `/autopopulate-roles` → This route auto-populates the `roles` collection with standard `admin`, `editor`, and `user` entries with the appropriate capabilities.

  * `/autopopulate-users` → This route auto-populates the `Users` collection with dummy `admin`, `editor`, and `user` entries with matching `username`s, `password`s, and `role`s.

-----

#### `.src/auth/auth.router.js`
##### Exported Values and Methods
This module provides routes and associated handlers for the following authentication routes:

* `POST`
  * `/signup` → Used to create a new user account; returns an authorization token.

  * `/signin` → Used to authenticate a session; returns an authorization token.

  * `/key` → Returns a permanent authorization key.

-----


#### `.src/auth/middleware.js`
##### Exported Values and Methods
This authentication middleware is invoked for all routes that require access control. It accepts a `capability` argument when the server starts and returns a function. The function is invoked when the route is accessed.

The returned function splits the user's request headers and uses private functions `_authBasic`, `_authBearer` and `_authenticate`, and their internal calls, to further parse and validate them. Internal method `_authError` handles errors from invalid request headers.

-----

#### `.src/auth/roles.schema.js`
##### Exported Values and Methods
This module defines a Mongoose schema `Roles` with the following properties:

```
  role: { type: String, required: true },
  capabilities: { type: Array, required: true },
```
This collection is virtually joined with the `Users` collection on their respective `role` keys.

-----

#### `.src/auth/users.schema.js`
##### Exported Values and Methods
This module defines a mongoose schema `Users` with the following properties:
```
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String },
  role: { type: String, required: true, default: 'user', enum: ['admin', 'editor', 'user'] },
```
It then adds multiple `pre` hooks and methods `authenticateBasic`,`comparePassword`, `authenticateToken`, `createFromOauth`, `generateToken`, `generateKey`, and `can`, used in authentication and session management.

This collection is virtually joined with the `Roles` collection on their respective `role` keys.

-----

#### `.src/middleware/404.js`
##### Exported Values and Methods
Unknown path fallback middleware.

Publishes the request `url` as an `error` event to the `database` namespace of the message queue.

-----

#### `./src/middleware/500.js`
##### Exported Values and Methods
Server error handling middleware.

Publishes the request `url` and error message in an `error` event to the `dataspace` namespace of the message queue.

-----

#### `./src/middleware/model-finder.js`
##### Exported Values and Methods
This module dynamically evaluates the `model` the `v1` API will use to invoke REST methods in response to various requests to its routes. The `model` is determined by the `:model` parameter on requests to `/api/v1/:model/*`.

The model is expected to be an instance of a class that extends the `ModelClass` from `./src/models/model.model.js`. It is expected to have `get`, `post`, `put`, `patch`, and `delete` methods. 

In this application, a sample `BooksModel` is provided at `./src/models/books/books.model.js`.

-----

#### `./src/models/model.model.js`
##### Exported Values and Methods
This module exports a `ModelClass` class that can be instantiated with a Mongoose schema. It has the following methods:

* `get(id)` → If an `id` argument is provided, this method will return a Promise that resolves to a single record object. If no `id` argument is provided, this method will return a Promise that resolves to an array of all the collection's records.
* `post(obj)` → This method takes a record object and returns a Promise that resolves to the posted record, which has been added to the database.
* `patch(id, obj)` → This method takes `id` and `obj` arguments and updates a record with the given `id` with the `obj` in the collection. No new records will be created. The method returns a Promise that resolves to the updated record.
* `put(id, obj)` → This method takes `id` and `obj` arguments and updates a record with the given `id` with the `obj` in the collection. If an object with the given `id` does not exist, it will be created. The method returns a Promise that resolves to the updated record.
* `delete(id)` →  The method takes an `id` argument and returns a Promise that resolves to the deleted record.

-----

#### `./src/models/books/books.model.js`
##### Exported Values and Methods
This is an example module to demonstrate how models are dynamically incorporated into the API Server. In the `./src/models/` directory, a directory with the name `{model}` (here, `books`) was created. Inside the directory is a file named `{model}.model.js` (here, `books.model.js`) that extends the `ModelClass` from `./src/models/model.model.js`.

In this case, the `Books` model extends the `books` schema at `./src/models/books/books.schema.js`.

Because the `books` model has been incorporated into this folder, its methods will be accessible via the endpoint routes. E.g., `/api/v1/books` is a valid instance of `/api/v1/{model}`.

-----

#### `./src/models/books/books.schema.js`
##### Exported Values and Methods
This module defines a mongoose schema `books` with the following properties:
```
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, required: true /*, unique: true*/ },
  image_url: { type: String, required: true },
  description: { type: String, required: true },
  bookshelf: { type: String, required: true },

```
-----

### Setup
#### `.env` 
* `MONGODB_URI` - URL to the running mongo instance/db
* `PORT` - Port number
* `SECRET` - The key the application uses for JWT token signing
* `SINGLE_USE_TOKENS` - Boolean for whether single use tokens are issued
* `TOKEN_EXPIRE` - The amount of time before JWT tokens expire, expressed in seconds or a string describing a time span [zeit/ms](https://github.com/zeit/ms)
* `QUEUE_SERVER` - The full URL and port to which publications to the `Q` Message Queue should be directed.

#### Running the app
* Start a MongoDB database on your local machine that uses the `data` folder.
* Start the server on your local machine with `npm run start` or `npm run watch`.
* Ensure you have appropriate environmental variables set.

###### Populating the `roles` collection
Using the `httpie` application or a similar program, send the following commands to the server:

* `echo '{"role":"admin", "capabilities":["create","read","update","delete"]}' | http :3000/roles`

* `echo '{"role":"editor", "capabilities":["create", "read", "update"]}' | http :3000/roles`

* `echo '{"role":"user", "capabilities":["read"]}' | http :3000/roles`

Note that you can simply `POST` to `/autopopulate-roles` to populate the standard roles, e.g.:

* `http post :3000/autopopulate-roles`

###### Signing Up
Using the `httpie` application or a similar program, send the following commands to the server (you may use a custom username and password throughout):

`user` capabilities:
* `echo '{"username":"user", "password":"user", "role":"user"}' | http post :3000/signup`

`editor` capabilities:
* `echo '{"username":"editor", "password":"editor", "role":"editor"}' | http post :3000/signup`

`admin` capabilities:
* `echo '{"username":"admin", "password":"admin", "role":"admin"}' | http post :3000/signup`

Note again that for testing purposes, you may `POST` to `/autopopulate-users` to populate dummy users, e.g.:

* `http post :3000/autopopulate-users`

###### Using Protected Routes
You can interact with the protected routes using the following syntax and making substitutions for the words in all caps:

* `http METHOD :3000/ROUTE -a USERNAME:PASSWORD`


###### Populating the `books` (or other `{model}`) collection
See the above documentation on the `v1.router.js` for details. For the sake of an example, you can `GET` all the records in the `books` collection with the following command to `httpie`:

* `http :3000/api/v1/books`

You can `POST` a new book to the collection with:

* `echo '{"title":"Moby Dick", "author": "Herman Melville", "isbn": "9781435161405", "image_url": "https://pictures.abebooks.com/isbn/9781435161405-us.jpg", "description": "A whale of a tale!", "bookshelf": "Classics"}' | http post :3000/api/v1/books`

#### Tests
* How do you run tests?
  * `npm run test`
  * `npm run test-watch`
  * `npm run lint`
* What assertions were made?
* What assertions need to be / should be made?

#### UML
Link to an image of the UML for your application and response to events
