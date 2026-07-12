import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export function signToken(clientId) {
  return jwt.sign({ sub: clientId }, config.jwtSecret, { expiresIn: '7d' });
}

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.clientId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
