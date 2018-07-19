
/**
 * Module dependencies.
 */
import express from 'express';
import passport from 'passport';
import dotenv from 'dotenv';
import logger from 'mean-logger';
import io from 'socket.io';
import mongoose from 'mongoose';
import './walk';
import config from './config/config';
import passportConfig from './config/passport';
import expressConfig from './config/express';
import socketConfig from './config/socket/socket';
import routesConfig from './config/routes';

dotenv.config();

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Bootstrap db connection
mongoose.connect(config.MONGOHQ_URL, { autoIndex: false });

// bootstrap passport config
passportConfig(passport);

const app = express();

// express settings
expressConfig(app, passport);

// Bootstrap routes
routesConfig(express.Router(), passport, app);

// Start the app by listening on <port>
const { port } = config;
const server = app.listen(port);
const ioObj = io.listen(server, { log: false });
// game logic handled here
socketConfig(ioObj);

/* eslint no-console: 0 */
console.log(`Express app started on port ${port}`);

// Initializing logger
logger.init(app, passport, mongoose);

// expose app
export default app;
