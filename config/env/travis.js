module.exports = {
    "port": 3001,
    "app": {
        "name": "Cards for Humanity - Test on travis"
    },
    "facebook": {
        "clientID": "APP_ID",
        "clientSecret": "APP_SECRET",
        "callbackURL": "http://localhost:3000/auth/facebook/callback"
    },
    "twitter": {
        "clientID": "CONSUMER_KEY",
        "clientSecret": "CONSUMER_SECRET",
        "callbackURL": "http://localhost:3000/auth/twitter/callback"
    },
    "github": {
        "clientID": "APP_ID",
        "clientSecret": "APP_SECRET",
        "callbackURL": "http://localhost:3000/auth/github/callback"
    },
    "google": {
        "clientID": "APP_ID",
        "clientSecret": "APP_SECRET",
        "callbackURL": "http://localhost:3000/auth/google/callback"
    }
};