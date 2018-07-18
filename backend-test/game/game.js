
import io from 'socket.io-client';
import request from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';
import config from '../../config/config';
import app from '../../server';

const User = mongoose.model('User');

const socketURL = `http://localhost:${config.port}`;


const options = {
  transports: ['websocket'],
  'force new connection': true
};

const userMock = {
  name: 'kelvin8',
  password: '123456',
  username: 'kelvin8',
  email: 'kelvin8@email.com'
};
let userId;

describe('Game Server', () => {
  before(() => {
    Promise.resolve(User.remove({}));
  });

  it('POST /api/auth/signup should return the userId', (done) => {
    request(app)
      .post('/api/auth/signup')
      .send(userMock)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.statusCode).to.equal(201);
        userId = res.body._id;
        done();
      });
  });

  it('Should accept requests to joinGame', (done) => {
    const client1 = io.connect(socketURL, options);
    const disconnect = () => {
      client1.disconnect();
      done();
    };
    client1.on('connect', () => {
      client1.emit('joinGame', { userId, room: '', createPrivate: false });
      setTimeout(disconnect, 200);
    });
  });

  it('Authenticated user should joinGame once', (done) => {
    const client1 = io.connect(socketURL, options);
    let client2;
    const disconnect = () => {
      client1.disconnect();
      client2.disconnect();
      done();
    };
    client1.on('connect', () => {
      client1.emit('joinGame', { userId, room: '', createPrivate: false });
      client1.on('gameUpdate', (data) => {
        expect(data.players.length).to.equal(1);
      });
      client2 = io.connect(socketURL, options);
      client2.on('connect', () => {
        client2.emit('joinGame', { userId, room: '', createPrivate: false });
        client2.on('gameUpdate', (data) => {
          expect(data.players.length).to.equal(1);
        });
      });
      setTimeout(disconnect, 500);
    });
  });

  it('UnAuthenticated user can join a game more than once', (done) => {
    const client1 = io.connect(socketURL, options);
    let client2;
    const disconnect = () => {
      client1.disconnect();
      client2.disconnect();
      done();
    };
    client1.on('connect', () => {
      client1.emit('joinGame', { userId: 'unauthenticated', room: '', createPrivate: false });
      client1.on('gameUpdate', (data) => {
        expect(data.players.length).to.equal(1);
      });
      client2 = io.connect(socketURL, options);
      client2.on('connect', () => {
        client2.on('gameUpdate', (data) => {
          expect(data.players.length).to.equal(2);
        });
      });
      setTimeout(disconnect, 500);
    });
  });

  it('Should send a game update upon receiving request to joinGame', (done) => {
    const client1 = io.connect(socketURL, options);
    const disconnect = () => {
      client1.disconnect();
      done();
    };
    client1.on('connect', () => {
      client1.emit('joinGame', { userID: 'unauthenticated', room: '', createPrivate: false });
      client1.on('gameUpdate', (data) => {
        data.gameID.should.match(/\d+/);
      });
      setTimeout(disconnect, 200);
    });
  });

  it('Should announce new user to all users', (done) => {
    const client1 = io.connect(socketURL, options);
    let client2;
    const disconnect = () => {
      client1.disconnect();
      client2.disconnect();
      done();
    };
    client1.on('connect', () => {
      client1.emit('joinGame', { userId: 'unauthenticated', room: '', createPrivate: false });
      client2 = io.connect(socketURL, options);
      client2.on('connect', () => {
        client2.emit('joinGame', { userId: 'unauthenticated', room: '', createPrivate: false });
        client1.on('notification', (data) => {
          data.notification.should.match(/ has joined the game!/);
        });
      });
      setTimeout(disconnect, 200);
    });
  });
  describe('Game Server', () => {
    it('Should update leftPlayers array when a player left a game', (done) => {
      let client2, client3, client4, client5;
      const client1 = io.connect(socketURL, options);
      const disconnect = () => {
        client1.disconnect();
        client2.disconnect();
        client3.disconnect();
        client4.disconnect();
        client5.disconnect();
        done();
      };
      const expectStartGame = () => {
        client1.emit('startGame');
        client1.on('gameUpdate', (data) => {
          data.state.should.equal('czar picks card');
        });
        client2.on('gameUpdate', (data) => {
          data.state.should.equal('czar picks card');
        });
        client3.on('gameUpdate', (data) => {
          data.state.should.equal('czar picks card');
        });
        client4.on('gameUpdate', (data) => {
          data.state.should.equal('czar picks card');
        });
        setTimeout(disconnect, 200);
      };
      client1.on('connect', () => {
        client1.emit('joinGame', { userId, room: '', createPrivate: false });
        client2 = io.connect(socketURL, options);
        client2.on('connect', () => {
          client2.emit('joinGame', { userId: 'unauthenticated', room: '', createPrivate: false });
          client3 = io.connect(socketURL, options);
          client3.on('connect', () => {
            client3.emit('joinGame', { userId: 'unauthenticated', room: '', createPrivate: false });
            client4 = io.connect(socketURL, options);
            client4.on('connect', () => {
              client4.emit('joinGame', { userId: 'unauthenticated', room: '', createPrivate: false });
              client5 = io.connect(socketURL, options);
              client5.on('connect', () => {
                client5.emit('joinGame', { userId: 'unauthenticated', room: '', createPrivate: false });
                setTimeout(expectStartGame, 100);
              });
            });
          });
        });
      });
    });
  });

  it('Should start game when startGame event is sent with 3 players', (done) => {
    let client2, client3;
    const client1 = io.connect(socketURL, options);
    const disconnect = () => {
      client1.disconnect();
      client2.disconnect();
      client3.disconnect();
      done();
    };
    const expectStartGame = () => {
      client1.emit('startGame');
      client1.on('gameUpdate', (data) => {
        data.state.should.equal('czar picks card');
      });
      client2.on('gameUpdate', (data) => {
        data.state.should.equal('czar picks card');
      });
      client3.on('gameUpdate', (data) => {
        data.state.should.equal('czar picks card');
      });
      setTimeout(disconnect, 200);
    };
    client1.on('connect', () => {
      client1.emit('joinGame', { userID: 'unauthenticated', room: '', createPrivate: false });
      client2 = io.connect(socketURL, options);
      client2.on('connect', () => {
        client2.emit('joinGame', { userID: 'unauthenticated', room: '', createPrivate: false });
        client3 = io.connect(socketURL, options);
        client3.on('connect', () => {
          client3.emit('joinGame', { userID: 'unauthenticated', room: '', createPrivate: false });
          setTimeout(expectStartGame, 100);
        });
      });
    });
  });

  it('Should not start game when startGame event is sent with less than 3 players', (done) => {
    let client2;
    const client1 = io.connect(socketURL, options);
    const disconnect = () => {
      client1.disconnect();
      client2.disconnect();
      done();
    };
    const expectStartGame = () => {
      client1.emit('startGame');
      client1.on('gameUpdate', (data) => {
        data.state.should.equal('waiting for players to pick');
      });
      client2.on('gameUpdate', (data) => {
        data.state.should.equal('waiting for players to pick');
      });
      setTimeout(disconnect, 200);
    };
    client1.on('connect', () => {
      client1.emit('joinGame', { userID: 'unauthenticated', room: '', createPrivate: false });
      client2 = io.connect(socketURL, options);
      client2.on('connect', () => {
        client2.emit('joinGame', { userID: 'unauthenticated', room: '', createPrivate: false });
        setTimeout(expectStartGame, 100);
      });
    });
  });

  it('Should start only when game has more than 3 players are in a game', (done) => {
    let client2, client3, client4, client5, client6;
    const client1 = io.connect(socketURL, options);
    const disconnect = () => {
      client1.disconnect();
      client2.disconnect();
      client3.disconnect();
      client4.disconnect();
      client5.disconnect();
      client6.disconnect();
      done();
    };
    const expectStartGame = () => {
      client1.emit('startGame');
      client1.on('gameUpdate', (data) => {
        data.state.should.equal('czar picks card');
      });
      client2.on('gameUpdate', (data) => {
        data.state.should.equal('czar picks card');
      });
      client3.on('gameUpdate', (data) => {
        data.state.should.equal('czar picks card');
      });
      client4.on('gameUpdate', (data) => {
        data.state.should.equal('czar picks card');
      });
      client5.on('gameUpdate', (data) => {
        data.state.should.equal('czar picks card');
      });
      client6.on('gameUpdate', (data) => {
        data.state.should.equal('czar picks card');
      });
      setTimeout(disconnect, 200);
    };
    client1.on('connect', () => {
      client1.emit('joinGame', { userID: 'unauthenticated', room: '', createPrivate: true });
      let connectOthers = true;
      client1.on('gameUpdate', (data) => {
        const { gameID } = data;
        if (connectOthers) {
          client2 = io.connect(socketURL, options);
          connectOthers = false;
          client2.on('connect', () => {
            client2.emit('joinGame', { userID: 'unauthenticated', room: gameID, createPrivate: false });
            client3 = io.connect(socketURL, options);
            client3.on('connect', () => {
              client3.emit('joinGame', { userID: 'unauthenticated', room: gameID, createPrivate: false });
              client4 = io.connect(socketURL, options);
              client4.on('connect', () => {
                client4.emit('joinGame', { userID: 'unauthenticated', room: gameID, createPrivate: false });
                client5 = io.connect(socketURL, options);
                client5.on('connect', () => {
                  client5.emit('joinGame', { userID: 'unauthenticated', room: gameID, createPrivate: false });
                  client6 = io.connect(socketURL, options);
                  client6.on('connect', () => {
                    client6.emit('joinGame', { userID: 'unauthenticated', room: gameID, createPrivate: false });
                    setTimeout(expectStartGame, 100);
                  });
                });
              });
            });
          });
        }
      });
    });
  });

  it('Should have a new game state for czar to pick card', (done) => {
    let client2, client3;
    const client1 = io.connect(socketURL, options);
    const disconnect = () => {
      client1.disconnect();
      client2.disconnect();
      client3.disconnect();
      done();
    };
    const expectStartGame = () => {
      client1.emit('startGame');
      client1.on('gameUpdate', (data) => {
        data.state.should.equal('czar picks card');
      });
      client2.on('gameUpdate', (data) => {
        data.state.should.equal('czar picks card');
      });
      client3.on('gameUpdate', (data) => {
        data.state.should.equal('czar picks card');
      });
      setTimeout(disconnect, 200);
    };
    client1.on('connect', () => {
      client1.emit('joinGame', { userID: 'unauthenticated', room: '', createPrivate: false });
      client2 = io.connect(socketURL, options);
      client2.on('connect', () => {
        client2.emit('joinGame', { userID: 'unauthenticated', room: '', createPrivate: false });
        client3 = io.connect(socketURL, options);
        client3.on('connect', () => {
          client3.emit('joinGame', { userID: 'unauthenticated', room: '', createPrivate: false });
          setTimeout(expectStartGame, 100);
        });
      });
    });
  });
});
