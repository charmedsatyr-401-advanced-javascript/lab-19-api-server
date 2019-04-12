'use strict';

/**
 * @param schema {object} Mongoose schema
 */
class ModelClass {
  constructor(schema) {
    this.schema = schema;
  }

  get(id) {
    return id ? this.schema.findById(id) : this.schema.find();
  }

  post(obj) {
    return new this.schema(obj).save();
  }

  // `patch` doesn't upsert; `put` does
  patch(id, obj) {
    return this.schema.findByIdAndUpdate(id, obj, { new: true });
  }

  put(id, obj) {
    return this.schema.findByIdAndUpdate(id, obj, { new: true, upsert: true });
  }

  delete(id) {
    return this.schema.findByIdAndDelete(id);
  }
}

module.exports = ModelClass;
