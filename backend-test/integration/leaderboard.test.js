import request from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';
import app from '../../server';
import { Tokenizer } from '../../app/helpers/tokenizer';

mongoose.Promise = global.Promise;

const Game = mongoose.model('Game');

const user = {
  _id: '5b31165a26a81e83ad097164',
  name: 'kevin',
  password: 'password',
};

const mockGames = [
  {
    players: [
      {
        userId: '5b31165a26a81e83ad097164',
        username: 'kevin',
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
          userId: '5b31165a26a81e83ad097164',
          username: 'kevin',
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
        userId: '5b31165a26a81e83ad097164',
        username: 'kevin',
        points: 0,
        premium: 0,
        color: 0,
      },
      {
        userId: '5b32262a772723aadeee9be6',
        username: 'Aggressive Pie',
        points: 0,
        premium: 0,
        color: 1,
      },
      {
        userId: 'unauthenticated',
        username: 'Toenail',
        points: 0,
        premium: 0,
        color: 2,
      }
    ],
    gameId: 1,
    meta: {
      playersLeftGame: [],
      players: [
        {
          userId: '5b32262a772723aadeee9be6',
          username: 'Hasstrup',
          points: 0,
          premium: 0,
          color: 0,
        },
        {
          userId: '5b31165a26a81e83ad097164',
          username: 'Kevin',
          points: 0,
          premium: 0,
          color: 1,
        },
        {
          userId: 'unauthenticated',
          username: 'Toenail',
          points: 0,
          premium: 0,
          color: 2,
        }
      ],
      state: 'game ended',
      round: 1,
      gameWinner: {
        userId: '5b32262a772723aadeee9be6',
        username: 'Hasstrup',
        points: 5,
        premium: 0,
        color: 1
      }
    }
  },
  {
    players: [
      {
        userId: '5b31165a26a81e83ad097164',
        username: 'kevin',
        points: 0,
        premium: 0,
        color: 0,
      },
      {
        userId: 'unauthenticated',
        username: 'Aggressive Pie',
        points: 0,
        premium: 0,
        color: 1,
      },
      {
        userId: 'unauthenticated',
        username: 'Toenail',
        points: 0,
        premium: 0,
        color: 2,
      }
    ],
    gameId: 1,
    meta: {
      playersLeftGame: [],
      players: [
        {
          userId: '5b31165a26a81e83ad097164',
          username: 'kevin',
          points: 0,
          premium: 0,
          color: 0,
        },
        {
          userId: 'unauthenticated',
          username: 'Aggressive Pie',
          points: 0,
          premium: 0,
          color: 1,
        },
        {
          userId: 'unauthenticated',
          username: 'Toenail',
          points: 0,
          premium: 0,
          color: 2,
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
  }
];

const token = Tokenizer(user);

describe('Player Leaderboard', () => {
  it('should return an error when no games have been played', (done) => {
    request(app)
      .get('/api/leaderboard')
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.statusCode).to.equal(404);
        expect(res.body.message).to.equal('No game found');
        done();
      });
  });
  describe('Games have been played', () => {
    before(() => {
      Promise.resolve(Game.create(mockGames));
    });

    after(() => {
      Promise.resolve(Game.remove({}));
    });

    it('should return an array of games for authenticated user', (done) => {
      request(app)
        .get('/api/leaderboard')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.statusCode).to.equal(200);
          expect(res.body.message).to.equal('Successfully retrieved games');
          expect(res.body.games).to.be.an('array');
          expect(res.body.games).to.have.length(2);
          done();
        });
    });

    it('should return an error for unauthenticated users', (done) => {
      request(app)
        .get('/api/leaderboard')
        .end((err, res) => {
          if (err) return done(err);
          expect(res.statusCode).to.equal(403);
          expect(res.body.message)
            .to.equal('You need to be authorized to access this route');
          done();
        });
    });

    it('should return an array of player objects with gamesWon field', (done) => {
      request(app)
        .get('/api/leaderboard')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.statusCode).to.equal(200);
          expect(res.body.message).to.equal('Successfully retrieved games');
          expect(res.body.games).to.be.an('array');
          expect(res.body.games).to.have.length(2);
          expect(res.body.games[0].gamesWon).to.be.a('number');
          done();
        });
    });
  });
});
