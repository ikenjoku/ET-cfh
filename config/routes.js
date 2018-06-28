import users from '../app/controllers/users';
import answers from '../app/controllers/answers';
import questions from '../app/controllers/questions';
import avatars from '../app/controllers/avatars';
import index from '../app/controllers/index';

module.exports = (router, passport) => {
  // User Routes
  router.get('/signin', users.signin);
  router.get('/signup', users.signup);
  router.get('/chooseavatars', users.checkAvatar);
  router.get('/signout', users.signout);

  // Setting up the users api
  router.post('/users', users.create);
  router.get('/doSome', users.doSome);
  router.post('/users/avatars', users.avatars);

  // Donation Routes
  router.post('/donations', users.addDonation);

  router.post('/users/session', passport.authenticate('local', {
    failureRedirect: '/signin',
    failureFlash: 'Invalid email or password.'
  }), users.session);

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

  return router;
};
