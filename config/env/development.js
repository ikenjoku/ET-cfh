module.exports = {
  app: {
    name: 'Cards for Humanity - Development'
  },
  port: process.env.PORT,
  MONGOHQ_URL: process.env.MONGOHQ_URL_DEV,
  facebook: {
    clientID: 'APP_ID',
    clientSecret: 'APP_SECRET',
    callbackURL: 'http://cardsforhumanity.com:3000/auth/facebook/callback'
  },
  twitter: {
    clientID: 'CONSUMER_KEY',
    clientSecret: 'CONSUMER_SECRET',
    callbackURL: 'http://cardsforhumanity.com:3000/auth/twitter/callback'
  },
  github: {
    clientID: 'APP_ID',
    clientSecret: 'APP_SECRET',
    callbackURL: 'http://cardsforhumanity.com:3000/auth/github/callback'
  },
  google: {
    clientID: 'APP_ID',
    clientSecret: 'APP_SECRET',
    callbackURL: 'http://cardsforhumanity.com:3000/auth/google/callback'
  }
};
