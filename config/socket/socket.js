import mongoose from 'mongoose';
import consoler from 'console-stamp';
import Game from './game';
import Player from './player';
import { all as avatars } from '../../app/controllers/avatars';

// disabling no-shadow globally because the socket are contained in different scopes where applied
/* eslint-disable no-shadow */
consoler(console, 'm/dd HH:MM:ss');
const User = mongoose.model('User');
let gameIDStr;

// Valid characters to use to generate random private game IDs
const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';

export default (io) => {
  const allGames = {};
  const allPlayers = {};
  const gamesNeedingPlayers = [];
  let gameID = 0;

  io.sockets.on('connection', (socket) => {
    socket.emit('id', { id: socket.id });

    socket.on('pickCards', (data) => {
      if (allGames[socket.gameID]) {
        allGames[socket.gameID].pickCards(data.cards, socket.id);
      }
    });

    socket.on('new-message', (data) => {
      if (!allGames[socket.gameID] || !allPlayers[socket.id]) return;
      const targetGame = allGames[socket.gameID];
      const playerObject = targetGame.players.filter(player => player.socket.id === socket.id);
      const { username, avatar } = playerObject[0];
      data.origin = { username, avatar: avatar || '' };
      allGames[socket.gameID].handleIncomingMessage(data)(socket);
    });

    socket.on('pickWinning', (data) => {
      if (allGames[socket.gameID]) {
        allGames[socket.gameID].pickWinning(data.card, socket.id);
      }
    });

    const setUpGame = (socket, game, player) => {
      game.players.push(player);
      socket.join(game.gameID);
      socket.gameID = game.gameID;
      game.assignPlayerColors();
      game.assignGuestNames();
      game.sendUpdate();
      game.sendNotification(`${player.username} has joined the game!`);
      if (game.pending) return game.prepareGame();
      return game;
    };

    const createGameWithFriends = (player, socket) => {
      let isUniqueRoom = false;
      let uniqueRoom = '';
      // Generate a random 6-character game ID
      while (!isUniqueRoom) {
        uniqueRoom = '';
        for (let i = 0; i < 6; i += 1) {
          uniqueRoom += chars[Math.floor(Math.random() * chars.length)];
        }
        if (!allGames[uniqueRoom] && !(/^\d+$/).test(uniqueRoom)) {
          isUniqueRoom = true;
        }
      }
      const game = new Game(uniqueRoom, io);
      allPlayers[socket.id] = true;

      const isUserExist = game.players.find(
        user => user.userId === player.userId
      );
      if (isUserExist && player.userId !== 'unauthenticated') {
        return io.sockets.socket(socket.id).emit('userExist');
      }

      game.players.push(player);
      allGames[uniqueRoom] = game;
      socket.join(game.gameID);
      socket.gameID = game.gameID;
      game.assignPlayerColors();
      game.assignGuestNames();
      game.sendUpdate();
    };


    const fireGame = (player, socket) => {
      let game;
      if (gamesNeedingPlayers.length <= 0) {
        gameID += 1;
        gameIDStr = gameID.toString();
        game = new Game(gameIDStr, io);
        allPlayers[socket.id] = true;
        const isUserExist = game.players.find(
          user => user.userId === player.userId
        );
        if (isUserExist && player.userId !== 'unauthenticated') {
          return io.sockets.socket(socket.id).emit('userExist');
        }
        game.players.push(player);
        allGames[gameID] = game;
        gamesNeedingPlayers.push(game);
        socket.join(game.gameID);
        socket.gameID = game.gameID;
        game.assignPlayerColors();
        game.assignGuestNames();
        game.sendUpdate();
      } else {
        [game] = gamesNeedingPlayers;
        allPlayers[socket.id] = true;
        // const isUserExist = game.players.map(user => user.userId === player.userId);
        const isUserExist = game.players.find(user => user.userId === player.userId);
        if (isUserExist && player.userId !== 'unauthenticated') {
          return io.sockets.socket(socket.id).emit('userExist');
        }
        if (game.players.length < game.playerMaxLimit) {
          if (game.players.length === (game.playerMaxLimit - 1)) game.pending = true;
          return setUpGame(socket, game, player);
        }
        // dispatch a notification to the current socket
        gamesNeedingPlayers.shift();
        gameID += 1;
        gameIDStr = gameID.toString();
        game = new Game(gameIDStr, io);
        allPlayers[socket.id] = true;
        game.players.push(player);
        allGames[gameID] = game;
        gamesNeedingPlayers.push(game);
        socket.join(game.gameID);
        socket.gameID = game.gameID;
        game.assignPlayerColors();
        game.assignGuestNames();
        game.sendUpdate();
        io.sockets.socket(socket.id).emit('gameFilledUp');
      }
    };

    const getGame = (player, socket, requestedGameId, createPrivate) => {
      requestedGameId = requestedGameId || '';
      createPrivate = createPrivate || false;
      if (requestedGameId.length && allGames[requestedGameId]) {
        const game = allGames[requestedGameId];
        // Ensure that the same socket doesn't try to join the same game
        // This can happen because we rewrite the browser's URL to reflect
        // the new game ID, causing the view to reload.
        // Also checking the number of players, so node doesn't crash when
        // no one is in this custom room.
        if (game.state === 'awaiting players' && (!game.players.length
        || game.players[0].socket.id !== socket.id)) {
        // Put player into the requested game
          allPlayers[socket.id] = true;
          const isUserExist = game.players.find(
            user => user.userId === player.userId
          );
          if (isUserExist && player.userId !== 'unauthenticated') {
            return io.sockets.socket(socket.id).emit('userExist');
          }
          game.players.push(player);
          socket.join(game.gameID);
          socket.gameID = game.gameID;
          game.assignPlayerColors();
          game.assignGuestNames();
          game.sendUpdate();
          game.sendNotification(`${player.username} has joined the game!`);
          if (game.players.length >= game.playerMaxLimit) {
            gamesNeedingPlayers.shift();
            game.prepareGame();
          }
        } else {
        // TODO: Send an error message back to this user saying the game has already started
        }
      } else {
      // Put players into the general queue
        if (createPrivate) return createGameWithFriends(player, socket);
        fireGame(player, socket);
      }
    };


    const joinGame = (socket, data) => {
      const player = new Player(socket);
      data = data || {};
      player.userId = data.userId || 'unauthenticated';
      if (data.userId !== 'unauthenticated') {
        User.findOne({
          _id: data.userId
        }).exec((err, user) => {
          if (err) {
            return err; // Hopefully this never happens.
          }
          if (!user) {
          // If the user's ID isn't found (rare)
            player.username = 'Guest';
            player.avatar = avatars()[Math.floor(Math.random() * 4) + 12];
          } else {
            player.userId = user.id;
            player.username = user.name;
            player.premium = user.premium || 0;
            player.avatar = user.avatar || avatars()[Math.floor(Math.random() * 4) + 12];
          }
          getGame(player, socket, data.room, data.createPrivate);
        });
      } else {
      // If the user isn't authenticated (guest)
        player.username = 'Guest';
        player.avatar = avatars()[Math.floor(Math.random() * 4) + 12];
        getGame(player, socket, data.room, data.createPrivate);
      }
    };

    const exitGame = (socket) => {
      if (allGames[socket.gameID]) { // Make sure game exists
        const game = allGames[socket.gameID];
        delete allPlayers[socket.id];
        if (game.state === 'awaiting players'
        || game.players.length - 1 >= game.playerMinLimit) {
          game.removePlayer(socket.id);
        } else {
          game.stateDissolveGame();
          for (let j = 0; j < game.players.length; j += 1) {
            game.players[j].socket.leave(socket.gameID);
          }
          game.killGame();
          delete allGames[socket.gameID];
        }
      }
      socket.leave(socket.gameID);
    };

    socket.on('joinGame', (data) => {
      if (!allPlayers[socket.id]) {
        joinGame(socket, data);
      }
    });

    socket.on('joinNewGame', (data) => {
      exitGame(socket);
      joinGame(socket, data);
    });

    socket.on('czarSelectCard', () => {
      allGames[socket.gameID].beginRound(allGames[socket.gameID]);
    });

    socket.on('startGame', (region) => {
      if (allGames[socket.gameID]) {
        const thisGame = allGames[socket.gameID];
        if (thisGame.players.length >= thisGame.playerMinLimit) {
        // Remove this game from gamesNeedingPlayers so new players can't join it.
          gamesNeedingPlayers.forEach((game, index) => {
            if (game.gameID === socket.gameID) {
              return gamesNeedingPlayers.splice(index, 1);
            }
          });
          thisGame.prepareGame(region);
          thisGame.sendNotification('The game has begun!');
        }
      }
    });

    socket.on('leaveGame', () => {
      exitGame(socket);
    });

    socket.on('disconnect', () => {
      exitGame(socket);
    });
  });
};
