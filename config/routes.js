import { Router } from 'express';
import users from '../app/controllers/users';
import * as answers from '../app/controllers/answers';
import questions from '../app/controllers/questions';
import avatars from '../app/controllers/avatars';
import index from '../app/controllers/index';
import middleware from '../app/middleware/auth';

export default (router, passport, app) => {
  // api name spaced routes;
  const api = Router();
  api
    .post('/auth/login', users.handleLogin)
    .post('/auth/signup', users.handleSignUp);

  router.get('/signin', users.signin);
  router.get('/signup', users.signup);
  router.get('/chooseavatars', users.checkAvatar);
  router.get('/signout', users.signout);

  // Setting up the users api
  router.post('/users', users.create);
  router.post('/users/avatars', users.avatars);
  router.get('/users/findUsers/:searchKey', middleware.auth, users.findUsers);
  router.get('/users/findUsers/', middleware.auth, users.findUsers);
  router.post('/users/invite', middleware.auth, users.invite);

  // Donation Routes
  router.post('/donations', users.addDonation);

  router.get('/users/me', users.me);
  router.get('/users/:userId', users.show);

  // Setting the facebook oauth routes
  router.get('/auth/facebook', passport.authenticate('facebook', {
    scope: ['email'],
    failureRedirect: '/signin'
  }), users.signin);

  router.get('/auth/facebook/callback', passport.authenticate('facebook', {
    failureRedirect: '/signin'
  }), users.authCallback);

  // Setting the github oauth routes
  router.get('/auth/github', passport.authenticate('github', {
    failureRedirect: '/signin'
  }), users.signin);

  router.get('/auth/github/callback', passport.authenticate('github', {
    failureRedirect: '/signin'
  }), users.authCallback);

  // Setting the twitter oauth routes
  router.get('/auth/twitter', passport.authenticate('twitter', {
    failureRedirect: '/signin'
  }), users.signin);

  router.get('/auth/twitter/callback', passport.authenticate('twitter', {
    failureRedirect: '/signin'
  }), users.authCallback);

  // Setting the google oauth routes
  router.get('/auth/google', passport.authenticate('google', {
    failureRedirect: '/signin',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ]
  }), users.signin);

  router.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/signin'
  }), users.authCallback);

  // Finish with setting up the userId param
  router.param('userId', users.user);

  // Answer Routes
  router.get('/answers', answers.all);
  router.get('/answers/:answerId', answers.show);
  // Finish with setting up the answerId param
  router.param('answerId', answers.answer);

  // Question Routes
  router.get('/questions', questions.all);
  router.get('/questions/:questionId', questions.show);
  // Finish with setting up the questionId param
  router.param('questionId', questions.question);

  // Avatar Routes
  router.get('/avatars', avatars.allJSON);

  // Home route
  router.get('/play', index.play);
  router.get('/', index.render);

  // Registering the api namespaced middleware on the router middleware
  router.use('/api', api);

  app.use(router);


  app.use((err, req, res, next) => {
    // error from the '/api' namespaced routes
    if (err.status) return res.status(err.status).json({ message: err.message });
    // Treat as 404
    if (err.message.indexOf('not found')) return next();
    // Log it
    console.error(err.stack);
    // Error page
    res.status(500).render('500', {
      error: err.stack
    });
  });

  // refactored to the position to prevent overrides
  app.use((req, res) => {
    res.status(404).render('404', {
      url: req.originalUrl,
      error: 'Not found'
    });
  });
};
