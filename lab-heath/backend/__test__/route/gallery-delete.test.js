'use strict';


const mocks = require('../lib/mocks');
const superagent = require('superagent');
const server = require('../../lib/server');
require('jest');

describe('DELETE /api/v1/gallery', function() {
  beforeAll(server.start);
  afterAll(server.stop);
  afterAll(mocks.user.removeAll);
  afterAll(mocks.gallery.removeAll);

  beforeAll(() => mocks.user.createOne().then(data => this.mockUser = data));
  beforeAll(() => mocks.gallery.createOne().then(data => this.mockGallery = data));

  describe('Valid request', () => {
    it('should return a 204 delete status code', () => {
      let galleryMock = null;
      return mocks.gallery.createOne()
        .then(mock => {
          galleryMock = mock;
          return superagent.delete(`:${process.env.PORT}/api/v1/gallery/${galleryMock.gallery._id}`)
            .set('Authorization', `Bearer ${mock.token}`);
        })
        .then(response => {
          expect(response.status).toEqual(204);
        });
    });
  });

  describe('Invalid request', () => {
    it('should return a 401 given bad token', () => {
      return superagent.delete(`:${process.env.PORT}/api/v1/gallery`)
        .set('Authorization', 'Bearer BADTOKEN')
        .catch(err => expect(err.status).toEqual(401));
    });
    it('should return a 404 no found', () => {
      return superagent.delete(`:${process.env.PORT}/api/v1/galleryPOOP`)
        .set('Authorization', `Bearer ${this.mockUser.token}`)
        .catch(err => expect(err.status).toEqual(404));
    });
  });
});