import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'visarun-dev-secret-change-me';

export function signToken(clientId) {
  return jwt.sign({ sub: clientId }, JWT_SECRET, { expiresIn: '7d' });
}

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.clientId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
