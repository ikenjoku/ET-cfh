import jwt from 'jsonwebtoken';

/**
 * @function verifyToken
 * @param {string} data - A token
 * @returns { null } returns Unauthorized Access if token is undfefined
 */

const auth = (req, res, next) => {
  let token = req.headers.authorization || req.headers['x-access-token'];
  token = token.replace('Bearer ', '');

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
