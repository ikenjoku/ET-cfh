/**
 * Module dependencies.
 */
import mongoose from 'mongoose';
import gamesWonQuery from '../logic/gamesWonQuery';

mongoose.Promise = global.Promise;

const Game = mongoose.model('Game');

/**
 * @description Get games leaderboard
 *
 * @param {object} req
 * @param {object} res
 * @param {Function} next
 *
 * @returns {Array} returns the game array
 */
const leaderboard = (req, res, next) => Game.aggregate(gamesWonQuery())
  .then((games) => {
    if (games.length === 0) {
      const error = new Error('No game found');
      error.status = 404;
      return next(error);
    }
    return res.status(200).json({
      status: 'success',
      games,
      message: 'Successfully retrieved games',
    });
  })
  .catch(error => next(error));

/**
 * @description Get game history for currently signed in user
 *
 * @param {object} req
 * @param {object} res
 * @param {object} next
 *
 * @returns {Array} returns the game array
 */
const gameLog = (req, res, next) => Game.find({
  'players.userId': req.user._id,
}).exec()
  .then(games => res.status(200).json({
    games,
    status: 'success',
    message: 'Successfully retrieved games'
  }))
  .catch(error => next(error));

export default { leaderboard, gameLog };
