import 'babel-polyfill';
import request from 'supertest';
import faker from 'faker';
import { expect } from 'chai';
import mongoose from 'mongoose';
import app from '../../server';
import { Tokenizer } from '../../app/helpers/tokenizer';

mongoose.Promise = global.Promise;

const User = mongoose.model('User');
let token;

const mock = {
  name: 'Hasstrup Ezekiel',
  password: '12345',
  username: 'hasstrupezekiel',
  email: 'hasstrup@email.com'
};

describe('User endpoints', () => {
  describe('Authentication', () => {
    before(() => Promise.resolve(User.create(mock).then((user) => {
      token = Tokenizer(user);
    })
      .catch((err) => {
        throw err;
      })));

    it('POST /api/auth/login should return the user token along with the user object', (done) => {
      request(app)
        .post('/api/auth/login')
        .send(mock)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.statusCode).to.equal(200);
          expect(res.body.token).to.equal(Tokenizer(res.body));
          done();
        });
    });

    it('POST /api/auth/signup should return the token of a user on sign up', (done) => {
      const fake = {
        username: faker.internet.userName(),
        name: faker.name.findName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      request(app)
        .post('/api/auth/signup')
        .send(fake)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.statusCode).to.equal(201);
          expect(res.body.token).to.equal(Tokenizer(res.body));
          done();
        });
    });
  });
  describe('Show user profile', () => {
    it(' GET /api/profile Should return the profile of the user showing the games played(if any)', (done) => {
      request(app)
        .get('/api/profile')
        .set('Authorization', token)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.statusCode).to.equal(200);
          expect(res.body.data.name).to.equal('Hasstrup Ezekiel');
          expect(res.body.data.games).to.be.an('array');
          done();
        });
    });

    it('GET /api/profile shoulfd fail without a token with a 403 error', (done) => {
      request(app)
        .get('/api/profile')
        .end((err, res) => {
          if (err) return done(err);
          expect(res.statusCode).to.equal(403);
          done();
        });
    });
  });
});
