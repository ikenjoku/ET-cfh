/**
 * Module dependencies.
 */
import mongoose from 'mongoose';

const Game = mongoose.model('Game');

/**
 * @function gameResult
 * @param {object} data - An object containing game result to be saved in database
 * @description without friends parameter, it returns a status code 401
 *   with a warning message
 * It saves the game result to the database
 * @returns {object} returns the game result
 */
const gameResult = (req, res) => {
  let gameId = req.params.id;
  gameId = parseInt(gameId, 10);
  const { gameWinner, players } = req.body;
  if (!players) {
    return res.status(401).json({ message: 'Players have not joined the game' });
  }
  const payload = {
    gameWinner,
    players,
    gameId
  };
  const game = new Game(payload);
  game.save((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error saving game' });
    }
    return res.status(201).json(game);
  });
};

export default gameResult;
