import jwt from 'jsonwebtoken';
import { cfg } from '../config.js';
export function requireUser(req, res, next) {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, cfg.JWT_SECRET);
    req.user = decoded; // { id, username }
    next();
  } catch {
    res.status(403).json({ error: 'Invalid token' });
  }
}
