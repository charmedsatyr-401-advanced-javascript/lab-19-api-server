'use strict';

// Import environmental variables
require('dotenv').config();

// Import the server's `start` method
const { start } = require('./src/server.js');

// Start up database server with options
const mongoose = require('mongoose');

const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
};

mongoose.connect(process.env.MONGODB_URI, options, err => {
  if (err) {
    console.error(err);
  } else {
    console.log(`Mongoose connected...`);
  }
});

// Start the web server
start(process.env.PORT);
