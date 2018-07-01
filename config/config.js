/* eslint import/no-dynamic-require: 0 */ // --> OFF

const _ = require('underscore');

// Load app configuration
module.exports = _.extend(
  require(`${__dirname}/../config/env/all.js`),
  require(`${__dirname}/../config/env/${process.env.NODE_ENV}.js`),
);
