import allConfig from './env/all';

// Load app configuration
/* eslint global-require: 0, import/no-dynamic-require: 0 */
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const envConfig = require(`./env/${process.env.NODE_ENV}.js`) || {}
export default { ...allConfig, ...envConfig };


