require('dotenv').config();
/**
 * Module dependencies.
 */
const express = require('express');
const fs = require('fs');
const passport = require('passport');
const logger = require('mean-logger');
const io = require('socket.io');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Load configurations
// if test env, load example file


process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const mongoose = require('mongoose');
const config = require('./config/config');
const auth = require('./config/middlewares/authorization');

// Bootstrap db connection
mongoose.connect(config.MONGOHQ_URL);

// Bootstrap models
const modelsPath = `${__dirname}/app/models`;
const walk = (path) => {
  fs.readdirSync(path).forEach((file) => {
    const newPath = `${path}/${file}`;
    const stat = fs.statSync(newPath);
    if (stat.isFile()) {
      if (/(.*)\.(js|coffee)/.test(file)) {
        /* eslint global-require: 0 */
        /* eslint import/no-dynamic-require: 0 */
        require(newPath);
      }
    } else if (stat.isDirectory()) {
      walk(newPath);
    }
  });
};
walk(modelsPath);

// bootstrap passport config
require('./config/passport')(passport);

const app = express();

app.use((req, res, next) => {
  next();
});

// express settings
require('./config/express')(app, passport, mongoose);

// Bootstrap routes
require('./config/routes')(app, passport, auth);

// Start the app by listening on <port>
const { port } = config;
const server = app.listen(port);
const ioObj = io.listen(server, { log: false });
// game logic handled here
require('./config/socket/socket')(ioObj);

/* eslint no-console: 0 */
console.log(`Express app started on port ${port}`);

// Initializing logger
logger.init(app, passport, mongoose);

// expose app
module.exports = app;
