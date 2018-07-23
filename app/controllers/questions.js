/**
 * Module dependencies.
 */
import mongoose from 'mongoose';

const Question = mongoose.model('Question');

/**
 * @description returns grray or error on failed game load
 *
 * @param {object} req
 * @param {object} res
 * @param {Function} next
 * @param {object} id
 *
 * @returns {Array} returns the game array
 */
exports.question = (req, res, next, id) => {
  Question.load(id, (err, question) => {
    if (err) return next(err);
    if (!question) return next(new Error(`Failed to load question ${id}`));
    req.question = question;
    next();
  });
};

/**
* @description pass questions to req
*
* @param {object} req
* @param {object} res
* @param {Function} next
* @param {object} id
*
* @returns {Array} returns the game array
*/
exports.show = (req, res) => {
  res.jsonp(req.question);
};

/**
 * @description Get all games questions
 *
 * @param {object} req
 * @param {object} res
 * @param {Function} next
 * @param {object} id
 *
 * @returns {Array} returns the game array
 */
exports.all = (req, res) => {
  Question.find({ official: true, numAnswers: { $lt: 3 } }).select('-_id').exec((err, questions) => {
    if (err) {
      res.render('error', {
        status: 500
      });
    } else {
      res.jsonp(questions);
    }
  });
};

/**
 * @description Get games leaderboard
 *
 * @param {object} cb
 * @param {object} region
 *
 * @returns {Array} returns the game array according to region
 */
exports.allQuestionsForGame = (cb, region) => {
  Question.find({ official: true, region, numAnswers: { $lt: 3 } }).select('-_id').exec((err, questions) => {
    cb(questions);
  });
};
