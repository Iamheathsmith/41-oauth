
# LAB 17: Bearer Auth


### Installing and How to use.

To install this program, place fork and 'git clone' this repo to your computer. From the terminal, navigate to  `lab-heath`. once there, install NPM but typing in , `nmp install` and httpie(done with home) after that you need to install cors, express, body-parser, dotenv, faker,jsonwebtoken, mongoose, bcrypt `npm i`. for devolper Dependencies are superagent jest eslint do these with `npm i -D` you also need to have HTTPIE installed via homebrew `brew install httpie` in the terminal. this will let you do the helpful commands inside of the terminal.



next you need to have these scripts adjusted in your package.json file.

```javascript
 "scripts": {
    "start": "node index.js",
    "start:watch": "nodemon index.js",
    "start:debug": "DEBUG=http* nodemon index.js",
    "test": "jest -i",
    "test:watch": "jest -i --watchAll",
    "test:debug": "DEBUG=http* jest -i",
    "lint": "eslint .",
    "lint:test": "npm run lint && npm test",
    "start-db": "mkdir -p ./data/db && mongod --dbpath ./data/db",
    "stop-db": "killall mongod"
  },
  ```

from there, you can go to your terminal and type, 

```javascript
node run start
```
and this will start up your server, if you do `npn run start:watch`, this will let you see it in your localhost in your browser.

you will also need to start up your mongoDB also with the code below on a diffferent termail

```javascript
node run start-db
```

### some helpful commands  

these are you basic commands 

to sign up to the database
```javascript
http POST :3000/api/v1/signup username=tim email='tim@blah.com' password=stuff
```

this should return this 

```javascript
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6IjVmNGRjYzVlNjBlMTM2OWQ2ZGQ3NzQ5MmM3MDI5ZWQ3MmE3M2NkODlkNzBmZDVkNzdmOGEzOTU1MTAwMzE2YjMiLCJpYXQiOjE1MTc4ODE2MTN9.k3qz85cMxjTzAFsNFFptNkOwhQYW5eGWLZm-XGl6J_Q"

```

you can also sign in with this command
```javascript
http -a tim:stuff :3000/api/v1/signin
```

and look like this 
```javascript

"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImU4MjhjNDdiMmU0OGEyODVmYWZmMmIyMGVhOTc5ZjNmOWE0YTJhOTM3YWY5ZmI2NjZhNmNlMTVjYmQ1NWJmNzkiLCJpYXQiOjE1MTc4ODE2NDR9.Zap5cs7r4xG81CaHj819m7ELLNAce5yV16Hwg-QoRoE"
```
what this is doing is making sure we are not sending our password and user name around the server and database and we keep it secure. this is why you should get this type of data back.

### Testing

we are doing testing for the gallerys today and here is what they look like.



#### test for POST vaild

test 1: we are seeing if we get the right response code back.

```javascript
 describe('Valid request', () => {
    it('should return a 201 CREATED status code', () => {
      let galleryMock = null;
      return mocks.gallery.createOne()
        .then(mock => {
          galleryMock = mock;
          return superagent.post(`:${process.env.PORT}/api/v1/gallery`)
            .set('Authorization', `Bearer ${mock.token}`)
            .send({
              name: faker.lorem.word(),
              description: faker.lorem.words(4),
            });
        })
        .then(response => {
          expect(response.status).toEqual(201);
          expect(response.body).toHaveProperty('name');
          expect(response.body).toHaveProperty('description');
          expect(response.body).toHaveProperty('_id');
          expect(response.body.userId).toEqual(galleryMock.gallery.userId.toString());
        });
    });
  });
  ```

#### test for POST invaild

test 2: making sure we send a 401 status code if not auth.
test 2: making sure we send a 400 status code if the wrong path is given.

```javascript
  describe('Invalid request', () => {
    it('should return a 401 NOT AUTHORIZED given back token', () => {
      return superagent.post(`:${process.env.PORT}/api/v1/gallery`)
        .set('Authorization', 'Bearer BADTOKEN')
        .catch(err => expect(err.status).toEqual(401));
    });
    it('should return a 400 BAD REQUEST on improperly formatted body', () => {
      return superagent.post(`:${process.env.PORT}/api/v1/gallery`)
        .set('Authorization', `Bearer ${this.mockUser.token}`)
        .send({})
        .catch(err => expect(err.status).toEqual(400));
    });
  });
```

#### test for GET vaild


test 1: we should get the right response code back if we get just one user back
test 2: we should get the right response code back if we get all user back

```javascript
describe('Valid request', () => {
    it('should return all user galleries', () => {
      return superagent.get(`:${process.env.PORT}/api/v1/gallery`)
        .set('Authorization', `Bearer ${this.mockUser.token}`)
        .then(res => {
          expect(res.status).toEqual(200);
        }); 
    });
    it('should return a single gallery with an id', () => {
      return superagent.get(`:${process.env.PORT}/api/v1/gallery/${this.mockGallery.gallery._id}`)
        .set('Authorization', `Bearer ${this.mockUser.token}`)
        .then(res => {
          expect(res.status).toEqual(200);
        });
    }); 
  });
  ```

#### test for GET invaild

  test 3: you should get a 401 if you are not allowed to do such a thing.
  test 4: you should get a 404 if you use a bag ID.


  ```javascript
 it('should return a 401 NOT AUTHORIZED given back token', () => {
      return superagent.get(`:${process.env.PORT}/api/v1/gallery`)
        .set('Authorization', 'Bearer BADTOKEN')
        .catch(err => expect(err.status).toEqual(401));
    });
    it('should return a 404 with a bad ID', () => {
      return superagent.get(`:${process.env.PORT}/api/v1/gall`)
        .set('Authorization', `Bearer ${this.mockUser.token}`)
        .send({})
        .catch(err => expect(err.status).toEqual(404));
    });
  ```

  #### test for PUT vaild


test 1: we should get the right response code back if you updated the info.


```javascript
 it('should return a single gallery with an id', () => {
      return superagent.put(`:${process.env.PORT}/api/v1/gallery/${this.mockGallery.gallery._id}`)
        .set('Authorization', `Bearer ${this.mockUser.token}`)
        .send({
          name: faker.lorem.word(),
          description: faker.name.findName(),
        })
        .then(res => {
          expect(res.status).toEqual(204);
        });
    }); 
  ```

#### test for PUT invaild

  test 2: you should get a 401 if you are not allowed to do such a thing.
  test 3: you should get a 400 if you send a bad body back.
  test 4: you should get a 404 if you use a bag ID.


  ```javascript
 it('should return a 401 NOT AUTHORIZED given back token', () => {
      return superagent.put(`:${process.env.PORT}/api/v1/gallery/${this.mockGallery.gallery._id}`)
        .set('Authorization', 'Bearer BADTOKEN')
        .catch(err => expect(err.status).toEqual(401));
    });

    it('should return a 400 BAD REQUEST on improperly formatted body', () => {
      return superagent.put(`:${process.env.PORT}/api/v1/gallery/${this.mockGallery.gallery._id}`)
        .set('Authorization', `Bearer ${this.mockUser.token}`)
        .send({
          pepper: faker.lorem.word(),
        })
        .catch(err => expect(err.status).toEqual(400));
    });
    it('should return a 404 with a bad ID', () => {
      return superagent.put(`:${process.env.PORT}/api/v1/gallery/${this.mockGallery.gallery}`)
        .set('Authorization', `Bearer ${this.mockUser.token}`)
        .send({
          name: faker.lorem.word(),
          description: faker.name.findName(),
        })
        .catch(err => expect(err.status).toEqual(404));
    });
  ```

  #### test for DELETE vaild


test 1: we should get the right response code back if you remove the data


```javascript
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
  ```

#### test for DELETE invaild

  test 2: you should get a 401 if you are not allowed to do such a thing.
  test 3: you should get a 404 if you use a bag ID.


  ```javascript
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
  ```