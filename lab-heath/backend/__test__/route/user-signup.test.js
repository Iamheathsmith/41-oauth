'use strict';

const server = require('../../lib/server');
const superagent = require('superagent');
const User = require('../../model/auth');
const mocks = require('../lib/mocks');
const faker = require('faker');
require('jest');

describe('POST /api/v1/signup', function() {
  let base = `:${process.env.PORT}/api/v1/signup`;
  beforeAll(server.start);
  afterAll(server.stop);
  afterAll(mocks.user.removeAll);  

  describe('Valid req/res', () => {
    beforeAll(() => {
      return superagent.post(base)
        .send(new User({
          username: faker.name.firstName(),
          password: faker.internet.password(),
          email: faker.internet.email(),
        }))
        .then(res => this.response = res);
    });
  });

  it('should respond with a status of 201', () => {
    expect(this.response.status).toBe(201);
  });
  it('should post a new note with username and password and email', () => {
    expect(this.response.request._data).toHaveProperty('username');
    expect(this.response.request._data).toHaveProperty('password');
    expect(this.response.request._data).toHaveProperty('email');
  });

  
  describe('Invalid req/res', () => {
    it('should return a status 404 on bad path', () => {
      return superagent.post(':4000/api/v1/doesNotExist')
        .send(mocks.user.createOne())
        .catch(err => {
          expect(err.status).toBe(404);
        });
    });
    it('should return a status 400 on bad request body', () => {
      return superagent.post(base)
        .send(new User({
          username: '',
          password: faker.name.lastName(),
          email: faker.internet.email(),
        }))
        .catch(err => expect(err.status).toBe(400));
    });
  });
});

