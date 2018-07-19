import jwt from 'jsonwebtoken';

/**
 * @function verifyToken
 * @param {string} data - A token
 * @returns { null } returns Unauthorized Access if token is undfefined
 */

const auth = (req, res, next) => {
  let token = req.headers.authorization || req.headers['x-access-token'];

  if (!token) {
    const err = new Error('You need to be authorized to access this route');
    err.status = 403;
    return next(err);
  }

  token = token.replace('Bearer ', '');

  jwt.verify(token, process.env.SECRET_KEY, (err, result) => {
    if (err) {
      return res.status(401).json({ message: 'Please login!' });
    }
    req.decoded = result;
    req.user = result;
    next();
  });
};

export default auth;
