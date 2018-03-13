'use strict';

const Gallery = require('../model/gallery');
const bodyParser = require('body-parser').json();
const errorHandler = require('../lib/error-handler');
const bearerAuthMiddleware = require('../lib/bearer-auth-middleware');

const ERROR_MESSAGE = 'Authorization Failed';


module.exports = router => {
  
  router.route('/gallery/:_id?')
    .post(bearerAuthMiddleware,bodyParser,(request,response) => {
      request.body.userId = request.user._id;

      return new Gallery(request.body).save()
        .then(createdGallery => response.status(201).json(createdGallery))
        .catch(error => errorHandler(error,response));
    })

    .get(bearerAuthMiddleware,(request,response) => {
      if(request.params._id){
        return Gallery.findById(request.params._id)
          .then(gallery => response.status(200).json(gallery))
          .catch(error => errorHandler(error,response));
      }

      return Gallery.find()
        .then(galleries => {
          let galleriesIds = galleries.map(gallery => gallery._id);

          response.status(200).json(galleriesIds);
        })
        .catch(error => errorHandler(error,response));
    })
    .put(bearerAuthMiddleware, bodyParser, (request,response) => {
      Gallery.findById(request.params._id)
        .then(gallery => {
          if(gallery.userId === request.user._id)             {
            gallery.name = request.body.name || gallery.name;
            gallery.description = request.body.description || gallery.description;
            return gallery.save();
          }
          if (request.body.name === undefined || request.body.description === undefined ) {
            throw new Error('validation');
          }
        
          return new Error('validation');
        })
        .then(() => response.sendStatus(204))
        .catch(error => errorHandler(error,response));
    })

    .delete(bearerAuthMiddleware,(request,response) => {
      return Gallery.findById(request.params._id)
        .then(gallery => {
          if(gallery.userId.toString() === request.user._id.toString())
            return gallery.remove();
          
          return errorHandler(new Error(ERROR_MESSAGE),response);
        })
        .then(() => response.sendStatus(204))
        .catch(error => errorHandler(error,response));
    });
};