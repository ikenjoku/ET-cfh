import request from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';
import app from '../../server';
import { Tokenizer } from '../../app/helpers/tokenizer';

mongoose.Promise = global.Promise;

const Game = mongoose.model('Game');

const user = {
  _id: '5b50ef088cdad56a2570c6f0',
  name: 'Solz Dika',
  password: 'password',
};

const mockGames = [
  {
    players: [
      {
        userId: '5b50ef088cdad56a2570c6f0',
        username: 'Solz Dika',
        points: 0,
        premium: 0,
        color: 0
      },
      {
        userId: 'unauthenticated',
        username: 'Aggressive Pie',
        points: 0,
        premium: 0,
        color: 1
      },
      {
        userId: 'unauthenticated',
        username: 'Toenail',
        points: 0,
        premium: 0,
        color: 2
      }
    ],
    gameId: 1,
    meta: {
      playersLeftGame: [],
      players: [
        {
          userId: '5b50ef088cdad56a2570c6f0',
          username: 'Solz Dika',
          points: 0,
          premium: 0,
          color: 0
        },
        {
          userId: 'unauthenticated',
          username: 'Aggressive Pie',
          points: 0,
          premium: 0,
          color: 1
        },
        {
          userId: 'unauthenticated',
          username: 'Toenail',
          points: 0,
          premium: 0,
          olor: 2
        }
      ],
      state: 'game ended',
      round: 1,
      gameWinner: {
        userId: '5b31165a26a81e83ad097164',
        username: 'kevin',
        points: 5,
        premium: 0,
        color: 1
      }
    }
  },
  {
    players: [
      {
        userId: '5b50ef088cdad56a2570c6f0',
        username: 'Solz Dika',
        points: 0,
        premium: 0,
        color: 0
      },
      {
        userId: 'unauthenticated',
        username: 'Aggressive Pie',
        points: 0,
        premium: 0,
        color: 1
      },
      {
        userId: 'unauthenticated',
        username: 'Toenail',
        points: 0,
        premium: 0,
        color: 2
      }
    ],
    gameId: 1,
    meta: {
      playersLeftGame: [],
      players: [
        {
          userId: '5b50ef088cdad56a2570c6f0',
          username: 'Solz Dika',
          points: 0,
          premium: 0,
          color: 0
        },
        {
          userId: 'unauthenticated',
          username: 'Aggressive Pie',
          points: 0,
          premium: 0,
          color: 1
        },
        {
          userId: 'unauthenticated',
          username: 'Toenail',
          points: 0,
          premium: 0,
          olor: 2
        }
      ],
      state: 'game ended',
      round: 1,
      gameWinner: {
        userId: '5b31165a26a81e83ad097164',
        username: 'kevin',
        points: 5,
        premium: 0,
        color: 1
      }
    }
  },
  {
    players: [
      {
        userId: '5b50ef088cdad56a2570c6f0',
        username: 'Solz Dika',
        points: 0,
        premium: 0,
        color: 0
      },
      {
        userId: 'unauthenticated',
        username: 'Aggressive Pie',
        points: 0,
        premium: 0,
        color: 1
      },
      {
        userId: 'unauthenticated',
        username: 'Toenail',
        points: 0,
        premium: 0,
        color: 2
      }
    ],
    gameId: 1,
    meta: {
      playersLeftGame: [],
      players: [
        {
          userId: '5b50ef088cdad56a2570c6f0',
          username: 'Solz Dika',
          points: 0,
          premium: 0,
          color: 0
        },
        {
          userId: 'unauthenticated',
          username: 'Aggressive Pie',
          points: 0,
          premium: 0,
          color: 1
        },
        {
          userId: 'unauthenticated',
          username: 'Toenail',
          points: 0,
          premium: 0,
          olor: 2
        }
      ],
      state: 'game ended',
      round: 1,
      gameWinner: {
        userId: '5b31165a26a81e83ad097164',
        username: 'kevin',
        points: 5,
        premium: 0,
        color: 1
      }
    }
  },
];

const token = Tokenizer(user);

describe('Game History', () => {
  before((done) => {
    Game.create(mockGames).then(() => {
      done();
    });
  });

  after(() => {
    Promise.resolve(Game.remove({}));
  });

  it('should return an array of games for authenticated user', (done) => {
    request(app)
      .get('/api/games/history')
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.statusCode).to.equal(200);
        expect(res.body.message).to.equal('Successfully retrieved games');
        expect(res.body.games).to.be.an('array');
        expect(res.body.games).to.have.length(3);
        done();
      });
  });

  it('should return an error for unauthenticated users', (done) => {
    request(app)
      .get('/api/games/history')
      .end((err, res) => {
        if (err) return done(err);
        expect(res.statusCode).to.equal(403);
        expect(res.body.message)
          .to.equal('You need to be authorized to access this route');
        done();
      });
  });
});
