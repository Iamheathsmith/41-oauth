'use strict';


const Auth = require('../model/auth');
const superagent = require('superagent');
const GOOGLE_OAUTH_URL = 'https://www.googleapis.com/oauth2/v4/token';
const OPEN_ID_URL = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';

module.exports = function(router) {
  router.get('/oauth/google/code', (req,res) => {
  
    if(!req.query.code){
      res.redirect(process.env.CLIENT_URL);
    } else {
      console.log('__CODE__',req.query.code);

      return superagent.post(GOOGLE_OAUTH_URL)
        .type('form')
        .send({
          code: req.query.code,
          grant_type: 'authorization_code',
          client_id: process.env.GOOGLE_OAUTH_ID,
          client_secret: process.env.GOOGLE_OAUTH_SECRET,
          redirect_uri: `${process.env.API_URL}/oauth/google/code`,
        })
        .then(tokenResponse => {

          console.log('Step 3.2 - GOOGLE TOKEN');
  
          if(!tokenResponse.body.access_token)
            res.redirect(process.env.CLIENT_URL); 
  
          const token = tokenResponse.body.access_token;

          return superagent.get(OPEN_ID_URL)
            .set('Authorization', `Bearer ${token}`);
        })
        .then(openIDResponse => {
          console.log('Back from OpenID');
          console.log(openIDResponse.body);
          //-----------------------------------
          let temp = {
            username: openIDResponse.body.name,
            email: openIDResponse.body.email,
          };

          let user = new Auth(temp);
          console.log('this is user', user);

          user.save()
            .then(user => {
              return user.generateToken();
            })
            .then(token => {
              console.log('erereererererererererer',token);
              res.cookie('X-401d21-OAuth-Token',token);
              res.redirect(process.env.CLIENT_URL);
            });
        })
        .catch(error => {
          console.log('__ERROR__',error.message);
          res.cookie('X-401d21-OAuth-Token','');
          res.redirect(process.env.CLIENT_URL + '?error=oauth');
        });
    }
  });
};