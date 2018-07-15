import 'babel-polyfill';
import request from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';
import app from '../../server';

const User = mongoose.model('User');

const mockPlayers = {
  gameWinner: 'kevin',
  players: []
};

let mockUser;

const userMock = {
  name: 'kelvin',
  password: '12345',
  username: 'kelvin',
  email: 'kelvin@email.com'
};

let token = '';
describe('Player endpoints', () => {
  before(() => {
    Promise.resolve(User.create(userMock, (err, user) => {
      if (err) throw err;
      mockPlayers.players.push(user._id);
      mockPlayers.gameWinner = user._id;
      mockUser = user;
    }));
  });

  it('POST /api/auth/endpoint should return the user token along with the user', (done) => {
    request(app)
      .post('/api/auth/login')
      .send(userMock)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.statusCode).to.equal(200);
        /* eslint prefer-destructuring: 0 */
        token = res.body.token;
        done();
      });
  });

  it('POST /api/game/:id/start  endpoint should return the the game players', (done) => {
    request(app)
      .post('/api/game/3/start')
      .set('authorization', token)
      .send(mockPlayers)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.statusCode).to.equal(201);
        expect(res.body.gameWinner).to.equal(mockUser._id.toString());
        done();
      });
  });
});
