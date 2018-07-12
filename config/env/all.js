import path from 'path';
import dotenv from 'dotenv';

const rootPath = path.normalize(`${__dirname}/../..`);
dotenv.config();

module.exports = {
  root: rootPath,
  port: process.env.PORT || 3000,
  db: process.env.MONGODB_URI,
};
