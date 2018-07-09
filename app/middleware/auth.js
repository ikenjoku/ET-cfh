import 'babel-polyfill';
import jwt from 'jsonwebtoken';

/**
 * @function auth
 * @param {string} data - A token
 * @returns { null } returns Unauthorized Access if token is undfefined
 * @returns { expired } returns Please login
 * @description used to access authenticated route
 * @description if token is valid, decode the payload and pass it controller
 */

const auth = (req, res, next) => {
  const token = req.headers.authorization || req.headers['x-access-token'];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized Access' });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, result) => {
    if (err) {
      return res.status(401).json({ message: 'Please login!' });
    }
    req.decoded = result;
    next();
  });
};

export default auth;
