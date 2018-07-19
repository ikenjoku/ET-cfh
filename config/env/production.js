module.exports = {
  app: {
    name: 'Cards for Humanity'
  },
  MONGOHQ_URL: process.env.MONGODB_URI,
  facebook: {
    clientID: process.env.FB_CLIENT_ID,
    clientSecret: process.env.FB_CLIENT_SECRET,
    callbackURL: process.env.FB_CALLBACK_URL
  },
  twitter: {
    clientID: process.env.TWITTER_CUSTOMER_KEY,
    clientSecret: process.env.TWITTER_CUSTOMER_SECRET,
    callbackURL: process.env.TWITTER_CALLBACK_URL
  },
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  }
};
