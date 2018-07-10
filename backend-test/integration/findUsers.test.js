import 'babel-polyfill';
import request from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';
import app from '../../server';
import { Tokenizer } from '../../app/helpers/tokenizer';


const User = mongoose.model('User');

const user = {
  _id: '1232132',
  name: 'Benjamin Onah',
  password: 'wrongPassword',
};

const token = Tokenizer(user);


const mock = [
  {
    name: 'Ben Onah',
    password: '12345',
    email: 'benjamin@gmail.com'
  },
  {
    name: 'Onyedikachi Boss',
    password: '12345',
    email: 'benjamindika@gmail.com'
  },
  {
    name: 'Hasstrup Ezekiel',
    password: '12345',
    email: 'hasstrup@email.com'
  }
];

describe('User endpoints', () => {
  before(() => {
    Promise.resolve(User.create(mock));
  });

  after(() => {
    Promise.resolve(User.remove({}));
  });

  it('GET /users/findUsers/:searchKey should return statusCode 200 with 2 users', (done) => {
    request(app)
      .get('/users/findUsers/ben')
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.statusCode).to.equal(200);
        expect(res.body.users.length).to.equal(2);
        done();
      });
  });

  it('GET /users/findUsers/:searchKey should return statusCode 200 with no user', (done) => {
    request(app)
      .get('/users/findUsers/nothing')
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.statusCode).to.equal(200);
        expect(res.body.users.length).to.equal(0);
        done();
      });
  });
});
