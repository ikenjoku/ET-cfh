/**
 * Module dependencies.
 */

import mongoose from 'mongoose';

const Game = mongoose.model('Game');

const gameResult = (req, res) => {
  let gameId = req.params.id;
  gameId = parseInt(gameId, 10);
  const { gameStarter, gameWinner, players } = req.body;
  if (!gameStarter || !players) {
    return res.status(4000).json({ message: 'Game have not started' });
  }
  const payload = {
    gameStarter,
    gameWinner,
    players,
    gameId
  };
  const game = new Game(payload);
  game.save((err) => {
    if (err) {
      return res.status(401).json({ message: 'Error saving game' });
    }
    return res.status(201).json(game);
  });
};
export default gameResult;
