let _ = require('underscore');

// Load app configuration
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
console.log(process.env.NODE_ENV);
module.exports = _.extend(
  require('./env/all.js'),
  require(`./env/${  process.env.NODE_ENV  }.js`) || {}
);
