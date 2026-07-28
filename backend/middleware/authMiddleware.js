const jwt = require('jsonwebtoken');
const { findUserById } = require('../services/userService');

const JWT_SECRET = process.env.JWT_SECRET || 'intranet-dev-secret';

async function authenticate(req, res, next) {
  const header = req.get('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';

  if (!token) {
    return res.status(401).json({ message: 'Unauthenticated' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Unauthenticated' });
    }
    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthenticated' });
  }
}

module.exports = { authenticate };
