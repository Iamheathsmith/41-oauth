'use strict';

const User = require('../../model/auth');// vinicio - similar to a user
const faker = require('faker');
const Gallery = require('../../model/gallery');


const mock = module.exports = {};

// Auth Mocks - One, RemoveAll
mock.user = {};

mock.user.createOne = () => {
  let result = {};
  result.password = faker.internet.password();

  let user = new User({
    username: faker.internet.userName(),
    email: faker.internet.email(),
  });

  return user.generatePasswordHash(result.password)
    .then(auth => {
      result.auth = auth;
      return auth.save();
    })
    .then(auth => auth.generateToken())
    .then(token => {
      result.token = token;
      return result;
    });
};

mock.user.removeAll = () => Promise.all([User.remove()]);


mock.gallery = {};

mock.gallery.createOne = () => {
  let resultMock = null;

  return mock.user.createOne()
    .then(createdUserMock => resultMock = createdUserMock)
    .then(createdUserMock => {
      return new Gallery({
        name: faker.internet.domainWord(),
        description: faker.random.words(15),
        userId: createdUserMock.auth._id,
      }).save();
    })
    .then(gallery => {
    
      resultMock.gallery = gallery;
      return resultMock;
    });
};


mock.gallery.removeAll = () => Promise.all([Gallery.remove()]);