'use strict';

const { server } = require('../../server.js');
const supertest = require('supertest');
const request = supertest(server);

// TODO: Below are end-to-end tests;
// we could add unit tests that require the notFound import
// const errorHandler = require('../500.js');

describe('`500` error handler', () => {
  describe(`End-to-end tests`, () => {
    it('should return status `500` on a server error', () => {
      return request.get('/error').then(results => {
        expect(results.status).toBe(500);
      });
    });
    it('should not return at status on a good request', async () => {
      const result = await request.get('/');
      expect(result.status).not.toBe(500);
    });
  });
});
