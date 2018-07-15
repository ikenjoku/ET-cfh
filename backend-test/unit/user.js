
import { expect } from 'chai';
import mongoose from 'mongoose';
import Services from '../../app/logic/user';
import dataStore from './store';

// setting this to use promises subsequently
mongoose.Promise = global.Promise;
const { handleFetchProfile } = Services;

let mocks = [];
const User = mongoose.model('User');
const Game = mongoose.model('Game');


describe('User service objects', () => {
  describe('handleFetchProfile', () => {
    before(() => Promise.all(dataStore.map(user => User.create(user)))
      .then((users) => {
        mocks = users;
        Game.create({ gameWinner: users[0]._id, players: [...users] });
      }));

    after(() => {
      Promise.resolve(Game.remove({}));
      Promise.resolve(User.remove({}));
    });

    it('handleFetchProfile should fetch the a users profile along with the game history', () => handleFetchProfile(mocks[0]._id)
      .then((data) => {
        expect(data.email).to.equal('Test@user1.com');
        expect(data.name).to.equal('Test user 1');
        expect(data.gamesWon.length).to.equal(1);
        expect(data.gamesWon[0].gameWinner.name).to.equal(mocks[0].name);
        expect(data.games[0].players.length).to.equal(5);
      }));
  });
});
