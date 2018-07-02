import 'babel-polyfill';
import request from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';
import app from '../../server';
import { Tokenizer } from '../../app/helpers/tokenizer';

const User = mongoose.model('User');

const mock = {
  name: 'Hasstrup Ezekiel',
  password: '12345',
  username: 'hasstrupezekiel',
  email: 'hasstrup@email.com'
};

describe('Auth endpoints', () => {
  before(async () => {
    await User.create(mock);
  });

  it('POST /api/auth/endpoint should return the user token along with the', async () => {
    try {
      const res = await request(app).post('/api/auth/login').send(mock);
      expect(res.statusCode).to.equal(200);
      expect(res.body.token).to.equal(Tokenizer(res.body));
    } catch (err) {
      /* eslint no-unused-expressions: 0 */
      expect(err).to.not.exist;
    }
  });
});
