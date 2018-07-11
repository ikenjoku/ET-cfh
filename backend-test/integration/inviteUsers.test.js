/* eslint no-undef: 0 */
import request from 'supertest';
import { expect } from 'chai';
import app from '../../server';
import { Tokenizer } from '../../app/helpers/tokenizer';

const user = {
  _id: '1232132',
  name: 'Benjamin Onah',
  password: 'wrongPassword',
};

const token = Tokenizer(user);

describe('User endpoints', () => {
  it('POST /api/users/invite should return statusCode 200 with a user object', (done) => {
    const payload = {
      user: {
        name: 'Ben Onah',
        password: '12345',
        email: 'benjamin@gmail.com'
      },
      link: 'http://localhost:3333/app'
    };
    request(app)
      .post('/api/users/invite')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.statusCode).to.equal(200);
        expect(res.body.user).to.deep.equal(payload.user);
        done();
      });
  });

  it('POST /api/users/invite should return statusCode 400 with error message if wrong email is used', (done) => {
    const payload = {
      user: {
        name: 'Ben Onah',
        password: '12345',
        email: 'benjamingmail.com'
      },
      link: 'http://localhost:3333/app'
    };
    request(app)
      .post('/api/users/invite')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.statusCode).to.equal(400);
        expect(res.body.message).to.equal('An error occurred while sending the invitation');
        done();
      });
  });

  it('POST /api/users/invite should return statusCode 400 with error message if wrong link is used', (done) => {
    const payload = {
      user: {
        name: 'Ben Onah',
        password: '12345',
        email: 'benjamin@gmail.com'
      },
      link: 'htt/localhost:3333/app'
    };
    request(app)
      .post('/api/users/invite')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.statusCode).to.equal(400);
        expect(res.body.message).to.equal('An error occurred while sending the invitation');
        done();
      });
  });
});
