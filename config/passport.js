
import mongoose from 'mongoose';
import { Strategy as LocalStrategy } from 'passport-local';
// import { Strategy as TwitterStrategy } from 'passport-twitter';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import config from './config';

const TwitterStrategy = require('passport-twitter').Strategy;

const User = mongoose.model('User');

export default (passport) => {
  // Serialize sessions
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findOne({
      _id: id
    }, (err, user) => {
      user.email = null;
      user.facebook = null;
      user.hashed_password = null;
      done(err, user);
    });
  });

  // Use local strategy
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
    ((email, password, done) => {
      User.findOne({
        email
      }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, {
            message: 'Unknown user'
          });
        }
        if (!user.authenticate(password)) {
          return done(null, false, {
            message: 'Invalid password'
          });
        }
        // uncomment the email to still use sessions
        user.hashed_password = null;
        return done(null, user);
      });
    })));

  // Use twitter strategy
  passport.use(new TwitterStrategy({
    consumerKey: config.twitter.clientID,
    consumerSecret: config.twitter.clientSecret,
    callbackURL: config.twitter.callbackURL,
    userProfileURL: 'https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true',
  },
    ((token, tokenSecret, profile, done) => {
      User.findOne({
        email: profile.emails[0].value
      }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          user = new User({
            name: profile.displayName,
            username: profile.username,
            avatar: profile.photos[0].value,
            email: profile.emails[0].value,
            provider: 'twitter',
            twitter: profile._json
          });
          user.save((err) => {
            if (err) console.log(err);
            return done(err, user);
          });
        } else {
          return done(err, user);
        }
      });
    })));

  // Use facebook strategy
  passport.use(new FacebookStrategy({
    clientID: config.facebook.clientID,
    clientSecret: config.facebook.clientSecret,
    callbackURL: config.facebook.callbackURL,
    profileFields: ['id', 'emails', 'displayName', 'picture.type(large)'],
  },
    ((accessToken, refreshToken, profile, done) => {
      User.findOne({
        email: (profile.emails && profile.emails[0].value)
      }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          user = new User({
            name: profile.displayName,
            email: (profile.emails && profile.emails[0].value) || '',
            avatar: profile.photos ? profile.photos[0].value : '',
            provider: 'facebook',
            facebook: profile
          });
          user.save((err) => {
            user.facebook = null;
            return done(err, user);
          });
        } else {
          user.facebook = null;
          return done(err, user);
        }
      });
    })));

  // Use google strategy
  passport.use(new GoogleStrategy({
    clientID: config.google.clientID,
    clientSecret: config.google.clientSecret,
    callbackURL: config.google.callbackURL
  },
    ((accessToken, refreshToken, profile, done) => {
      User.findOne({
        email: profile.emails[0].value
      }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            username: profile.username,
            avatar: profile._json.picture,
            provider: 'google',
            google: profile._json
          });
          user.save((err) => {
            if (err) console.log(err);
            return done(err, user);
          });
        } else {
          return done(err, user);
        }
      });
    })));
};
