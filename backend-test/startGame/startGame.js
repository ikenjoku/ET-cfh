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

const userMock = {
  name: 'kelvin',
  password: '12345',
  username: 'kelvin',
  email: 'kelvin@email.com'
};

let token = '';
let id = '';
describe('Player endpoints', () => {
  before(() => {
    Promise.resolve(User.create(userMock, (err, user) => {
      if (err) throw err;
      mockPlayers.players.push(user._id);
      mockPlayers.gameWinner = user._id;
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
        id = res.body._id;
        done();
      });
  });

  it('POST /api/tour/:id endpoint should update the tour option to true', (done) => {
    request(app)
      .post(`/api/tour/${id}`)
      .set('authorization', token)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.statusCode).to.equal(200);
        expect(res.body.tourUpdated).to.equal(true);
        done();
      });
  });
});
