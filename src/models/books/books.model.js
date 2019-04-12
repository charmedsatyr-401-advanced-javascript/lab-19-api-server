'use strict';

const ModelClass = require('../model.model.js');
const BooksSchema = require('./books.schema.js');

/**
 * @param schema {object} Mongoose schema
 */
class BooksModel extends ModelClass {}

module.exports = new BooksModel(BooksSchema);
