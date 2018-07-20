import { expect } from 'chai';
import firebase from 'firebase';
import { spy, stub } from 'sinon';
import * as ChatHandler from '../../app/logic/GameChat';

let game, spy1, stub1;

const mockSocket = {
  gameID: '123',
  broadcast: {
    to: () => ({
      emit: () => {
      }
    })
  }
};


describe('Game Chat Service Object', () => {
  before(() => {
    // disbaling func names to preserve the scope of this
    /* eslint-disable-next-line func-names */
    const Game = function () { this.messages = []; };
    Game.prototype.handleIncomingMessage = ChatHandler.handleIncomingMessage;
    Game.prototype.endConversation = ChatHandler.endConversation;
    Game.prototype.__getGameDetails = ChatHandler.__getGameDetails;
    Game.prototype.__persistDataToDb = ChatHandler.__persistDataToDb;
    game = new Game();
    spy1 = spy(mockSocket.broadcast, 'to');
    // you might need to reset this variant on whether you might be needing firebase;
    stub1 = stub(firebase, 'database');
    stub1.returns({ ref: () => ({ set: () => null }) });
  });

  describe('handleIncomingMessage', () => {
    it('should fail if there is an error from the content sent', () => {
      try {
        game.handleIncomingMessage({})({});
      } catch (err) {
        expect(err.message).to.equal('Sorry, thats a bad message being sent');
        expect(err.status).to.equal(400);
      }
    });

    it('should push the incoming message to the messages and dispatch to the sockets', () => {
      const message = { content: 'Hello world', origin: { username: 'Hasstrup Ezekiel' }, gameId: '234' };
      game.handleIncomingMessage(message)(mockSocket);
      expect(game.messages.length).to.equal(1);
      expect(game.messages[0].content).to.equal('Hello world');
      expect(spy1.calledWithExactly(mockSocket.gameID)).to.equal(true);
    });
  });

  describe('Helper private methods', () => {
    before(() => {
      game.mongooseID = '5467367262ff';
      game.players = [{ username: 'Test Player1', userId: 'unauthenticated' }, { username: 'Test Player3', userId: 'unauthenticated' }];
      game.messages = [{ content: 'Hello World' }];
    });

    it('__getGameDetails should return an object containing, the mongoose id of a game along with players and messages', () => {
      const gameDetails = game.__getGameDetails();
      expect(gameDetails.players[0].username).to.equal('Test Player1');
      expect(gameDetails.messages[0].content).to.equal('Hello World');
    });

    it('__persistDataToDb should return false if there isnt any authenticated user in the palyers', () => {
      expect(game.__persistDataToDb()).to.equal(false);
    });

    it('__persistDataToDb should return true with the presence of an authenticated user', () => {
      game.players.push({ userId: '54332ftfgg' });
      expect(game.__persistDataToDb()).to.equal(true);
    });

    describe('endConversation method', () => {
      afterEach(() => stub1.reset());
      it('should persist data to db if there is an authenticated user in the game players', () => {
        game.endConversation();
        expect(stub1.calledOnce).to.equal(true);
      });

      it('should not persist data if there are no authenticated users in the game players', () => {
        // remove the last unauthenticated user we added;
        game.players.pop();
        game.endConversation();
        expect(stub1.calledOnce).to.equal(false);
      });
    });
  });
});
