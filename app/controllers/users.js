/**
 * Module dependencies.
 */

import mongoose from 'mongoose';
import passport from 'passport';
import avatarsList from './avatars';
import { Tokenizer } from '../helpers/tokenizer';

const avatarsArray = avatarsList.all();
const User = mongoose.model('User');


// disabling no underscore because of the default style of mongoose ids
/* eslint no-underscore-dangle: 0, valid-jsdoc: 0 */

/**
 * @param {object} req - request object provided by express
 * @param {object} res - response object provided by express
 * @description controller called after successful passport social auth strategy
*/
const authCallback = (req, res) => {
  res.redirect('/chooseavatars');
};


/**
 * @param {object} req - request object provided by express
 * @param {object} res - response object provided by express
 * @description controller handling GET '/signin', to redirects to the angular route.
 * Provides signin form if no user present, redirects to the main game if there is.
*/
const signin = (req, res) => {
  if (!req.user) {
    res.redirect('/#!/signin?error=invalid');
  } else {
    res.redirect('/#!/app');
  }
};


/**
 * @param {object} req - request object provided by express
 * @param {object} res - response object provided by express
 * @param {function} next - next function for passing the request to next handler
 * @param {object} passport - passport with all the startegies registered
 * @description Controller for handling requests to '/api/auth/login', returns token in response as JSON.
 *  Uses Tokenizer helper method to handle generation of token
*/
const handleLogin = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: info.message });
    const token = Tokenizer(user);
    res.status(200).json({ ...user._doc, token });
  })(req, res, next);
};


/**
 * @param {object} req - request object provided by express
 * @param {object} res - response object provided by express
 *
*/
const signup = (req, res) => {
  if (!req.user) {
    res.redirect('/#!/signup');
  } else {
    res.redirect('/#!/app');
  }
};

/**
 * @param {object} req - request object provided by express
 * @param {object} res - response object provided by express
 *
*/
const signout = (req, res) => {
  req.logout();
  res.redirect('/');
};

/**
 * @param {object} req - request object provided by express
 * @param {object} res - response object provided by express
 * @description function that checks that the current user has an avatar
 * and redirects to choose avatar when none
*/
const checkAvatar = (req, res) => {
  if (req.user && req.user._id) {
    User.findOne({
      _id: req.user._id
    })
      .exec((err, user) => {
        if (user.avatar !== undefined) {
          res.redirect('/#!/');
        } else {
          res.redirect('/#!/choose-avatar');
        }
      });
  } else {
    // If user doesn't even exist, redirect to /
    res.redirect('/');
  }
};


/**
 * @param {object} req - request object provided by express
 * @param {object} res - response object provided by express
 * @param {function} next - next function for passing the request to next handler
 * @description controller that creates a new user on POST '/api/users'
*/
const create = (req, res, next) => {
  if (req.body.name && req.body.password && req.body.email) {
    User.findOne({
      email: req.body.email
    }).exec((err, existingUser) => {
      if (!existingUser) {
        const user = new User(req.body);
        // Switch the user's avatar index to an actual avatar url
        user.avatar = avatarsArray[user.avatar];
        user.provider = 'local';
        user.save((err) => {
          if (err) {
            return res.render('/#!/signup?error=unknown', {
              errors: err.errors,
              user
            });
          }
          req.logIn(user, (err) => {
            if (err) return next(err);
            return res.redirect('/#!/');
          });
        });
      } else {
        return res.redirect('/#!/signup?error=existinguser');
      }
    });
  } else {
    return res.redirect('/#!/signup?error=incomplete');
  }
};

/**
 * @param {object} req - request object provided by express
 * @param {object} res - response object provided by express
 * @description controller handling uploading choosing avatars on POST '/api/users/avatars'
*/
const avatars = (req, res) => {
  // Update the current user's profile to include the avatar choice they've made
  if (req.user && req.user._id && req.body.avatar !== undefined
    && /\d/.test(req.body.avatar) && avatarsArray[req.body.avatar]) {
    User.findOne({
      _id: req.user._id
    })
      .exec((err, user) => {
        user.avatar = avatarsArray[req.body.avatar];
        user.save();
      });
  }
  return res.redirect('/#!/app');
};


/**
 * @param {object} req - request object provided by express
 * @param {object} res - response object provided by express
 * @description controller handling the new donations request on POST '/api/donations',
 * expects that the request body contains crowdrise data, and the amount.
*/
const addDonation = (req, res) => {
  if (req.body && req.user && req.user._id) {
    // Verify that the object contains crowdrise data
    if (req.body.amount && req.body.crowdrise_donation_id && req.body.donor_name) {
      User.findOne({
        _id: req.user._id
      })
        .exec((err, user) => {
        // Confirm that this object hasn't already been entered
          let duplicate = false;
          for (let i = 0; i < user.donations.length; i++) {
            if (user.donations[i].crowdrise_donation_id === req.body.crowdrise_donation_id) {
              duplicate = true;
            }
          }
          if (!duplicate) {
            console.log('Validated donation');
            user.donations.push(req.body);
            user.premium = 1;
            user.save();
          }
        });
    }
  }
  res.send();
};

/**
 * @param {object} req - request object provided by express
 * @param {object} res - response object provided by express
 * @description controller that shows a specfific user on GET '/api/users/:userId'.
*/
const show = (req, res) => {
  const user = req.profile;
  res.render('users/show', {
    title: user.name,
    user
  });
};

/**
 * @param {object} req - request object provided by express
 * @param {object} res - response object provided by express
 * @description controller that shows the current user on GET '/api/me'
*/
const me = (req, res) => {
  res.jsonp(req.user || null);
};

/**
 * @param {object} req - request object provided by express
 * @param {object} res - response object provided by express
 * @param {function} next - next function for passing the request to next handler
 * @param {string} id - mongoose id of the user
 * @description finds a user by id from the db and
 * assigns the user to the profile key on the request object
*/
const user = (req, res, next, id) => {
  User
    .findOne({
      _id: id
    })
    .exec((err, userObject) => {
      if (err) return next(err);
      if (!userObject) return next(new Error(`Failed to load user ${id}`));
      req.profile = userObject;
      next();
    });
};

export default {
  authCallback,
  user,
  me,
  show,
  addDonation,
  create,
  checkAvatar,
  signout,
  signup,
  signin,
  handleLogin,
  avatars
};
