import jwt from 'jsonwebtoken';
import { cfg } from '../config.js';
export function requireAdmin(req,res,next){
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if(!token) return res.status(401).json({ error:'No token' });
  try{
    const decoded = jwt.verify(token, cfg.JWT_SECRET);
    if(decoded.role !== 'admin') throw new Error('not admin');
    req.admin = decoded.user; return next();
  }catch(e){ return res.status(403).json({ error:'Invalid token' }); }
}
