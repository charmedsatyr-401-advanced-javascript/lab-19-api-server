'use strict';

const { server } = require('../../server.js');
const supertest = require('supertest');
const request = supertest(server);

// These tests should be made with `supergoose`
// in a way that takes care of authorization.

xdescribe('Book Routes', () => {
  describe('`GET` `/` route', () => {
    it('should return status `200` on a good request', async () => {
      const response = await request.get('/');
      expect(response.status).toBe(200);
    });
  });

  describe('`GET` `/api/v1/books` route', () => {
    it('should return status `200` on a good request', async () => {
      const response = await request.get('/api/v1/books');
      expect(response.status).toBe(200);
    });
  });

  describe('`GET` `/api/v1/books/:id` route', () => {
    it('should return status `200` on a good request', async () => {
      const id = 1;
      const response = await request.get(`/api/v1/books/${id}`);
      expect(response.status).toBe(200);
    });
  });

  describe('`POST` `/api/v1/books` route', () => {
    it('should return status `200` on a good request', async () => {
      const response = await request.post(`/api/v1/books`);
      expect(response.status).toBe(200);
    });
  });

  describe('`PUT` `/api/v1/books/:id` route', () => {
    it('should return status `200` on a good request', async () => {
      const id = 1;
      const response = await request.put(`/api/v1/books/${id}`);
      expect(response.status).toBe(200);
    });
  });

  describe('`PATCH` `/api/v1/books/:id` route', () => {
    it('should return status `200` on a good request', async () => {
      const id = 1;
      const response = await request.patch(`/api/v1/books/${id}`);
      expect(response.status).toBe(200);
    });
  });

  describe('`DELETE` `/api/v1/books/:id` route', () => {
    it('should return status `200` on a good request', async () => {
      const id = 1;
      const response = await request.delete(`/api/v1/books/${id}`);
      expect(response.status).toBe(200);
    });
  });
});
