import async from 'async';
import mongoose from 'mongoose';
import _ from 'underscore';
import questions from '../../app/controllers/questions';
import { allAnswersForGame } from '../../app/controllers/answers';
import * as ChatHandler from '../../app/logic/GameChat';

const GameModel = mongoose.model('Game');

/* eslint func-names: 0 */
const guestNames = [
  'Disco Potato',
  'Silver Blister',
  'Insulated Mustard',
  'Funeral Flapjack',
  'Toenail',
  'Urgent Drip',
  'Raging Bagel',
  'Aggressive Pie',
  'Loving Spoon',
  'Swollen Node',
  'The Spleen',
  'Dingle Dangle'
];

/**
 * @returns {obj} a game instance to be used to handle requests from
 * the players in the socket
 * @param {*} gameID  this is the id generatedfor the game on initialization
 * @param {*} io this is the socket io connection from the server
 */
function Game(gameID, io) {
  this.io = io;
  this.gameID = gameID;
  this.playersLeftGame = [];
  this.players = []; // Contains array of player models
  this.table = []; // Contains array of {card: card, player: player.id}
  this.winningCard = -1; // Index in this.table
  this.gameWinner = -1; // Index in this.players
  this.messages = []; // where all the conversations in a game will be stored
  this.winnerAutopicked = false;
  this.czar = -1; // Index in this.players
  this.playerMinLimit = 3;
  this.playerMaxLimit = 12;
  this.pointLimit = 5;
  this.state = 'awaiting players';
  this.round = 0;
  this.questions = null;
  this.answers = null;
  this.curQuestion = null;
  this.timeLimits = {
    stateChoosing: 21,
    stateJudging: 16,
    stateResults: 6
  };
  // setTimeout ID that triggers the czar judging state
  // Used to automatically run czar judging if players don't pick before time limit
  // Gets cleared if players finish picking before time limit.
  this.choosingTimeout = 0;
  // setTimeout ID that triggers the result state
  // Used to automatically run result if czar doesn't decide before time limit
  // Gets cleared if czar finishes judging before time limit.
  this.judgingTimeout = 0;
  this.resultsTimeout = 0;
  this.guestNames = guestNames.slice();
}

Game.prototype.payload = function () {
  const players = [];
  this.players.forEach((player) => {
    players.push({
      hand: player.hand,
      points: player.points,
      username: player.username,
      avatar: player.avatar,
      premium: player.premium,
      socketID: player.socket.id,
      color: player.color,
      userId: player.userId
    });
  });

  const playersLeftGame = this.playersLeftGame.map(player => ({
    hand: player.hand,
    points: player.points,
    username: player.username,
    avatar: player.avatar,
    premium: player.premium,
    socketID: player.socket.id,
    color: player.color,
    userId: player.userId
  }));


  return {
    gameID: this.gameID,
    players,
    playersLeftGame,
    czar: this.czar,
    state: this.state,
    round: this.round,
    gameWinner: this.gameWinner,
    winningCard: this.winningCard,
    winningCardPlayer: this.winningCardPlayer,
    winnerAutopicked: this.winnerAutopicked,
    table: this.table,
    pointLimit: this.pointLimit,
    curQuestion: this.curQuestion
  };
};

Game.prototype.sendNotification = function (msg) {
  this.io.sockets.in(this.gameID).emit('notification', { notification: msg });
};

// Currently called on each joinGame event from socket.js
// Also called on removePlayer IF game is in 'awaiting players' state
Game.prototype.assignPlayerColors = function () {
  this.players.forEach((player, index) => {
    player.color = index;
  });
};

Game.prototype.assignGuestNames = function () {
  const self = this;
  this.players.forEach((player) => {
    if (player.username === 'Guest') {
      const randIndex = Math.floor(Math.random() * self.guestNames.length);
      // disabling this rule, because destructuring here is impractical
      /* eslint-disable-next-line */
      player.username = self.guestNames.splice(randIndex, 1)[0];
      if (!self.guestNames.length) {
        self.guestNames = guestNames.slice();
      }
    }
  });
};

Game.prototype.prepareGame = function () {
  this.state = 'game in progress';
  this.io.sockets.in(this.gameID).emit('prepareGame',
    {
      playerMinLimit: this.playerMinLimit,
      playerMaxLimit: this.playerMaxLimit,
      pointLimit: this.pointLimit,
      timeLimits: this.timeLimits
    });
  const self = this;
  async.parallel([
    this.getQuestions,
    this.getAnswers
  ], (err, results) => {
    [self.questions, self.answers] = results;
    self.startGame();
  });
};

Game.prototype.beginRound = function (self) {
  if (this.state === 'czar picks card') {
    this.stateChoosing(self);
  } else if (this.state === 'czar has left') {
    this.selectCzar(self);
  }
};

Game.prototype.selectCzar = function (self) {
  self.state = 'czar picks card';
  self.table = [];
  if (self.czar >= self.players.length - 1) {
    self.czar = 0;
  } else {
    self.czar += 1;
  }
  self.sendUpdate();
};

Game.prototype.startGame = function () {
  this.shuffleCards(this.questions);
  this.shuffleCards(this.answers);
  this.selectCzar(this);
  this.sendUpdate();
};

Game.prototype.sendUpdate = function () {
  this.io.sockets.in(this.gameID).emit('gameUpdate', this.payload());
};

Game.prototype.stateChoosing = function (self) {
  self.state = 'waiting for players to pick';
  // console.log(self.gameID,self.state);
  self.table = [];
  self.winningCard = -1;
  self.winningCardPlayer = -1;
  self.winnerAutopicked = false;
  self.curQuestion = self.questions.pop();
  if (!self.questions.length) {
    self.getQuestions((err, data) => {
      self.questions = data;
    });
  }
  self.round += 1;
  self.dealAnswers();
  self.sendUpdate();

  self.choosingTimeout = setTimeout(() => {
    self.stateJudging(self);
  }, self.timeLimits.stateChoosing * 1000);
};

Game.prototype.selectFirst = function () {
  if (this.table.length) {
    this.winningCard = 0;
    const winnerIndex = this._findPlayerIndexBySocket(this.table[0].player);
    this.winningCardPlayer = winnerIndex;
    this.players[winnerIndex].points += 1;
    this.winnerAutopicked = true;
    this.stateResults(this);
  } else {
    // console.log(this.gameID,'no cards were picked!');
    this.stateChoosing(this);
  }
};

Game.prototype.stateJudging = function (self) {
  self.state = 'waiting for czar to decide';
  // console.log(self.gameID,self.state);

  if (self.table.length <= 1) {
    // Automatically select a card if only one card was submitted
    self.selectFirst();
  } else {
    self.sendUpdate();
    self.judgingTimeout = setTimeout(() => {
      // Automatically select the first submitted card when time runs out.
      self.selectFirst();
    }, self.timeLimits.stateJudging * 1000);
  }
};

Game.prototype.stateResults = function (self) {
  self.state = 'winner has been chosen';
  // TODO: do stuff
  let winner = -1;
  for (let i = 0; i < self.players.length; i += 1) {
    if (self.players[i].points >= self.pointLimit) {
      winner = i;
    }
  }
  self.sendUpdate();
  self.resultsTimeout = setTimeout(() => {
    if (winner !== -1) {
      self.stateEndGame(winner);
    } else {
      self.selectCzar(self);
    }
  }, self.timeLimits.stateResults * 1000);
};

/**
 * @function getLeftPlayers
 * @return {players} Array of players
 * @description array of player object of left players
 */
Game.prototype.getLeftPlayers = function () {
  const leftPlayers = this.playersLeftGame.map(player => ({
    userId: player.userId,
    avater: player.avater,
    username: player.username,
    points: player.points,
    premium: player.premium,
    color: player.color
  }));
  return leftPlayers;
};

/**
 * @function getPlayers
 * @return {players} Array of players
 * @description array of player object when game ends or terminated
 */
Game.prototype.getPlayers = function () {
  const players = this.players.map(player => ({
    userId: player.userId,
    avater: player.avater,
    username: player.username,
    points: player.points,
    premium: player.premium,
    color: player.color
  }));
  return players;
};

/**
 * @function winnerOfGame
 * @return {object} gameWinner
 * @description array of player object when game ends or terminated
 */
Game.prototype.winnerOfGame = function () {
  let gameWinner = this.players[this.gameWinner];
  if (gameWinner) {
    gameWinner = {
      userId: gameWinner.userId,
      avater: gameWinner.avater,
      username: gameWinner.username,
      points: gameWinner.points,
      premium: gameWinner.premium,
      color: gameWinner.color
    };
  }
  return gameWinner;
};

/**
 * @function persistGame
 * @return {players} saves players to the DB
 * @description gameWinner won't be in the meta object if the game is terminated
 *   State in meta object is either game ended || game dissolved
 */
Game.prototype.persistGame = function () {
  const isAuthenticated = this.players.find(user => user.userId !== 'unauthenticated');
  if (isAuthenticated) {
    const players = [...this.getPlayers(), ...this.getLeftPlayers()];
    const payload = {
      gameId: this.gameID,
      players,
      meta: {
        playersLeftGame: this.getLeftPlayers(),
        players: this.getPlayers(),
        gameWinner: this.winnerOfGame(),
        state: this.state,
        round: this.round,
      }
    };
    if (!(payload.meta.state === 'game dissolved' && payload.meta.gameWinner)) {
      const newGame = new GameModel(payload);
      newGame.save();
    }
  }
};

Game.prototype.stateEndGame = function (winner) {
  this.state = 'game ended';
  this.gameWinner = winner;
  this.sendUpdate();
  this.persistGame();
  this.endConversation();
};

Game.prototype.stateDissolveGame = function () {
  this.state = 'game dissolved';
  this.sendUpdate();
  this.persistGame();
};

Game.prototype.getQuestions = function (cb) {
  questions.allQuestionsForGame((data) => {
    cb(null, data);
  });
};

Game.prototype.getAnswers = function (cb) {
  allAnswersForGame((data) => {
    cb(null, data);
  });
};

Game.prototype.shuffleCards = function (cards) {
  let shuffleIndex = cards.length;
  let temp;
  let randNum;

  while (shuffleIndex) {
    randNum = Math.floor(Math.random() * (shuffleIndex -= 1));
    temp = cards[randNum];
    cards[randNum] = cards[shuffleIndex];
    cards[shuffleIndex] = temp;
  }

  return cards;
};

Game.prototype.dealAnswers = function (maxAnswers) {
  maxAnswers = maxAnswers || 10;
  const self = this;
  const storeAnswers = function (err, data) {
    self.answers = data;
  };
  for (let i = 0; i < this.players.length; i += 1) {
    while (this.players[i].hand.length < maxAnswers) {
      this.players[i].hand.push(this.answers.pop());
      if (!this.answers.length) {
        this.getAnswers(storeAnswers);
      }
    }
  }
};

Game.prototype._findPlayerIndexBySocket = function (thisPlayer) {
  let playerIndex = -1;
  _.each(this.players, (player, index) => {
    if (player.socket.id === thisPlayer) {
      playerIndex = index;
    }
  });
  return playerIndex;
};

Game.prototype.pickCards = function (thisCardArray, thisPlayer) {
  // Only accept cards when we expect players to pick a card
  if (this.state === 'waiting for players to pick') {
    // Find the player's position in the players array
    const playerIndex = this._findPlayerIndexBySocket(thisPlayer);
    if (playerIndex !== -1) {
      // Verify that the player hasn't previously picked a card
      let previouslySubmitted = false;
      _.each(this.table, (pickedSet) => {
        if (pickedSet.player === thisPlayer) {
          previouslySubmitted = true;
        }
      });
      if (!previouslySubmitted) {
        // Find the indices of the cards in the player's hand (given the card ids)
        const tableCard = [];
        for (let i = 0; i < thisCardArray.length; i += 1) {
          let cardIndex = null;
          for (let j = 0; j < this.players[playerIndex].hand.length; j += 1) {
            if (this.players[playerIndex].hand[j].id === thisCardArray[i]) {
              cardIndex = j;
            }
          }
          if (cardIndex !== null) {
            tableCard.push(this.players[playerIndex].hand.splice(cardIndex, 1)[0]);
          }
        }
        if (tableCard.length === this.curQuestion.numAnswers) {
          this.table.push({
            card: tableCard,
            player: this.players[playerIndex].socket.id
          });
        }
        if (this.table.length === this.players.length - 1) {
          clearTimeout(this.choosingTimeout);
          this.stateJudging(this);
        } else {
          this.sendUpdate();
        }
      }
    }
  }
};

Game.prototype.getPlayer = function (thisPlayer) {
  const playerIndex = this._findPlayerIndexBySocket(thisPlayer);
  if (playerIndex > -1) {
    return this.players[playerIndex];
  }
  return {};
};

Game.prototype.removePlayer = function (thisPlayer) {
  const playerIndex = this._findPlayerIndexBySocket(thisPlayer);

  if (playerIndex !== -1) {
    // Just used to send the remaining players a notification
    const playerName = this.players[playerIndex].username;

    // If this player submitted a card, take it off the table
    for (let i = 0; i < this.table.length; i += 1) {
      if (this.table[i].player === thisPlayer) {
        this.table.splice(i, 1);
      }
    }
    this.playersLeftGame.push(this.players[playerIndex]);
    // Remove player from this.players
    this.players.splice(playerIndex, 1);

    if (this.state === 'awaiting players') {
      this.assignPlayerColors();
    }

    // Check if the player is the czar
    if (this.czar === playerIndex) {
      // If the player is the czar...
      // If players are currently picking a card, advance to a new round.
      if (this.state === 'waiting for players to pick') {
        clearTimeout(this.choosingTimeout);
        this.sendNotification('The Czar left the game! Starting a new round.');
        return this.stateChoosing(this);
      }
      if (this.state === 'waiting for czar to decide') {
        // If players are waiting on a czar to pick, auto pick.
        this.sendNotification('The Czar left the game! First answer submitted wins!');
        this.pickWinning(this.table[0].card[0].id, thisPlayer, true);
      }
    } else {
      // Update the czar's position if the removed player is above the current czar
      if (playerIndex < this.czar) {
        this.czar -= 1;
      }
      this.sendNotification(`${playerName} has left the game`);
    }
    this.sendUpdate();
  }
};

Game.prototype.pickWinning = function (thisCard, thisPlayer, autopicked) {
  autopicked = autopicked || false;
  const playerIndex = this._findPlayerIndexBySocket(thisPlayer);
  if ((playerIndex === this.czar || autopicked) && this.state === 'waiting for czar to decide') {
    let cardIndex = -1;
    _.each(this.table, (winningSet, index) => {
      if (winningSet.card[0].id === thisCard) {
        cardIndex = index;
      }
    });
    if (cardIndex !== -1) {
      this.winningCard = cardIndex;
      const winnerIndex = this._findPlayerIndexBySocket(this.table[cardIndex].player);
      this.sendNotification(`${this.players[winnerIndex].username} has won the game`);
      this.winningCardPlayer = winnerIndex;
      this.players[winnerIndex].points += 1;
      clearTimeout(this.judgingTimeout);
      this.winnerAutopicked = autopicked;
      this.stateResults(this);
    }
  } else {
    this.sendUpdate();
  }
};

Game.prototype.killGame = function () {
  clearTimeout(this.resultsTimeout);
  clearTimeout(this.choosingTimeout);
  clearTimeout(this.judgingTimeout);
  this.endConversation();
};

// chat handlers
Game.prototype.handleIncomingMessage = ChatHandler.handleIncomingMessage;
Game.prototype.endConversation = ChatHandler.endConversation;
Game.prototype.__getGameDetails = ChatHandler.__getGameDetails;
Game.prototype.__persistDataToDb = ChatHandler.__persistDataToDb;

export default Game;
