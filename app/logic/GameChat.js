import firebase from 'firebase';
import uuid from 'uuid/v4';
import firebaseConfig from '../../config/firebase';

/* eslint-disable func-names */

// Initialize firebase
if (!process.env.TRAVIS) {
  firebase.initializeApp(firebaseConfig);
}

/**
   * @name handleIncomingMessage
   * @description Handles new message from the client and push the
   * message to the game messages
   * @param {object} data an object containing the content of the message and
   * the origin and the gameId(which should implicitly be the room users are in)
   * @returns {obj} thehandle messages array
   */
export const handleIncomingMessage = function (data) {
  return (socket) => {
    if (data.content && data.origin && socket.gameID) {
      this.messages.push(data);
      return socket.broadcast.to(socket.gameID).emit('incoming-message', data);
    }
    const error = new Error('Sorry, thats a bad message being sent');
    error.status = 400;
    throw error;
  };
};


/**
     * @name endConversation
     * @description this method gets the chat object and persists it to firebase if neccessary
     * @returns {null} returns null
    */
export const endConversation = function () {
  if (this.__persistDataToDb()) {
    // this should save the messages to firebase
    this.firebaseID = uuid();
    firebase.database().ref(`chats/${this.firebaseID}`).set(this.__getGameDetails());
  }
};


/**
     * @name __getGameDetails
     * @private
     * @description This method helps generate the gamechat data that should
     * be persisted to the database
     * @returns {object} This is the final data that gets persisted to the db
     */
export const __getGameDetails = function () {
  const { players, messages } = this;
  const filteredPlayers = players.map(player => ({
    username: player.username,
    userId: player.userId,
  }));
  return {
    players: filteredPlayers,
    messages,
    createdAt: Date.now()
  };
};


/**
     * @private
     * @name __persistDataToDb
     * @description Instance method that checks whether there is an authenticated
     * player in the gameplayers
     * @returns {boolean} returns true if there is, and false otherwise
     */
export const __persistDataToDb = function () {
  const data = this.players.filter(player => player.userId !== 'unauthenticated');
  if (data.length) return true;
  return false;
};
