/**
 * @module Services this module is created to wrap the
 *  core logic of all the controllers so that the logic is
 *  unit testable
 */

import mongoose from 'mongoose';

const User = mongoose.model('User');
const Game = mongoose.model('Game');

/**
 * @name returnGamesWon
 * @type {function}
 * @param {array} games The games that the requesting user has played
 * @param {object} user The current user
 * @description this method sorts through the games provided and
 * checks where the current user has won, uses .toString() because direct _id
 * comparison seems buggy and anomalous
 * @returns {object} The user object and the games played;
 */
function returnGamesWon(games, user) {
  try {
    /* eslint max-len: 0 */
    // disabled max-len to keep to syntax sugar
    return games.filter(game => game.meta.gameWinner && game.meta.gameWinner.userId.toString() === user._id.toString());
  } catch (e) {
    return [];
  }
}


/**
 * @name handleFetchProfile
 * @type {function}
 * @param {string} _id The user id, should be a mongoose ObjectID type (usually a string)
 * @description this method check for a user and all the games he/she has played,
 * populating the players and the winner in the process.;
 * @returns {object} The user object and the games played;
 */
const handleFetchProfile = _id => new Promise((resolve, reject) => {
  User.findOne({ _id }, (err, user) => {
    if (err) reject(err);
    if (user) {
      return Game.find({
        'players.userId': user._id.toString()
      })
        .exec((err, games) => {
          if (err) return reject(err);
          // using toString() because these methods behave anomalously
          const gamesWon = returnGamesWon(games, user);
          return resolve({ ...user._doc, games, gamesWon });
        });
    }
    const error = new Error('There is no user matching the query');
    error.status = 403;
    reject(error);
  });
});


export default {
  handleFetchProfile
};
