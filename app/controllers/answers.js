/**
 * Module dependencies.
 */
import mongoose from 'mongoose';

const Answer = mongoose.model('Answer');


/**
 * @description Get answers and pass it to req
 *
 * @param {object} req
 * @param {object} res
 * @param {Function} next
 * @param {object} id
 *
 * @returns {Array} returns the answer array
 */
export const answer = (req, res, next, id) => {
  Answer.load(id, (err, answerObject) => {
    if (err) return next(err);
    if (!answerObject) return next(new Error(`Failed to load answer ${id}`));
    req.answer = answerObject;
    next();
  });
};

/**
 * @description Get games leaderboard
 *
 * @param {object} req
 * @param {object} res
 * @param {Function} next
 * @param {object} id
 *
 * @returns {Array} returns the game array
 */
export const show = (req, res) => {
  res.jsonp(req.answer);
};

/**
 * @description Get games leaderboard
 *
 * @param {object} req
 * @param {object} res
 *
 * @returns {Array} returns the game array
 */
export const all = (req, res) => {
  Answer.find({ official: true }).select('-_id').exec((err, answers) => {
    if (err) {
      res.render('error', {
        status: 500
      });
    } else {
      res.jsonp(answers);
    }
  });
};

/**
 * @description Get games leaderboard
 *
 * @param {object} cb
 * @param {object} region
 *
 * @returns {Array} returns the game array
 */
export const allAnswersForGame = (cb, region) => {
  Answer.find({ official: true, region }).select('-_id').exec((err, answers) => {
    cb(answers);
  });
};
