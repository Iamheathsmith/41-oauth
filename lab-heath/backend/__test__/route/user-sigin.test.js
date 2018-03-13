'use strict';

const server = require('../../lib/server');
const superagent = require('superagent');
const mocks = require('../lib/mocks');
require('jest');

describe('GET /api/v1/signup', function() {
  let base = `:${process.env.PORT}/api/v1/signin`;
  beforeAll(server.start);
  afterAll(server.stop);
  afterAll(mocks.user.removeAll);
  

  describe('Valid req/res', () => {
    beforeAll(() => {
      return mocks.user.createOne()
        .then(data => {
          this.authData = data;
          return superagent.get(base)
            .auth(this.authData.auth.username, data.password)
            .then(res => this.test = res);
        });
    });
  });

  it('should respond with a status of 200', () => {
    expect(this.test.status).toBe(200);
  });
  it('should get a 401 if the user could not be authenticated', () => {
    return superagent.get(base)
      .auth('jogn', 'hello')
      .catch(err => {
        expect(err.status).toBe(401);
      });
  });
});

