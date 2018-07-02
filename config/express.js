/**
 * Module dependencies.
 */
import express from 'express';
import logger from 'morgan';
import compress from 'compression';
import helpers from 'view-helpers';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import config from './config';

/* eslint no-console: 0 */
export default (app, passport) => {
  app.set('showStackError', true);

  // Should be placed before express.static
  app.use(compress({
    filter: (req, res) => (/json|text|javascript|css/).test(res.getHeader('Content-Type')),
    level: 9
  }));

  // Setting the fav icon and static folder
  app.use(express.static(`${config.root}/public`));

  // Don't use logger for test env
  if (process.env.NODE_ENV !== 'test') {
    app.use(logger('dev')); // express ^4 has deprecated express.logger and .favicon
  }

  // Set views path, template engine and default layout
  app.set('views', `${config.root}/app/views`);
  app.set('view engine', 'jade');

  // Enable jsonpnex
  app.enable('jsonp callback');

  // bodyParser should be above methodOverride
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(methodOverride());

  // dynamic helpers
  app.use(helpers(config.app.name));
};
