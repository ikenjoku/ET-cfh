
import { expect } from 'chai';
import mongoose from 'mongoose';
import Services from '../../app/logic/user';
import dataStore from './store';

// setting this to use promises subsequently
mongoose.Promise = global.Promise;
const { handleFetchProfile } = Services;

let mocks = [];
const User = mongoose.model('User');


describe('User service objects', () => {
  describe('handleFetchProfile', () => {
    before(() => Promise.all(dataStore.map(user => User.create(user)))
      .then((users) => {
        mocks = users;
      }));

    after(() => {
      Promise.resolve(User.remove({}));
    });

    it('handleFetchProfile should fetch the a users profile along with the game history', () => handleFetchProfile(mocks[0]._id)
      .then((data) => {
        expect(data.email).to.equal('Test@user1.com');
        expect(data.name).to.equal('Test user 1');
      }));
  });
});
