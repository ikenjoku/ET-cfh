module.exports = {
  app: {
    name: 'Cards for Humanity - Development'
  },
  port: process.env.PORT,
  MONGOHQ_URL: process.env.MONGODB_URI,
  facebook: {
    clientID: process.env.FB_CLIENT_ID,
    clientSecret: process.env.FB_CLIENT_SECRET,
    callbackURL: process.env.FB_CALLBACK_URL
  },
  twitter: {
    clientID: '401685871994-3i58in34j7qpngdka5ci54hh441n9a3q.apps.googleusercontent.com","project_id":"et-cfh-210520","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://accounts.google.com/o/oauth2/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":"sHJSbinFDieBRDG2SKceCJN1',
    clientSecret: 'sHJSbinFDieBRDG2SKceCJN1',
    callbackURL: 'http://cardsforhumanity.com:3000/auth/twitter/callback'
  },
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  }
};
