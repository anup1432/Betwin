import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { cfg } from '../config.js';
const r = Router();

r.post('/admin/login', async (req,res)=>{
  const { username, password } = req.body || {};
  if(username===cfg.ADMIN_USER && password===cfg.ADMIN_PASS){
    const token = jwt.sign({ role:'admin', user: username }, cfg.JWT_SECRET, { expiresIn:'3h' });
    return res.json({ ok:true, token });
  }
  return res.status(401).json({ error:'Invalid credentials' });
});

r.post('/signup', async (req,res)=>{
  const { username, password } = req.body || {};
  if(!username || !password) return res.status(400).json({ error:'Missing fields' });
  const exists = await User.findOne({ username });
  if(exists) return res.status(400).json({ error:'Username taken' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, passwordHash, balance:0 });
  res.json({ ok:true, username: user.username });
});

r.post('/login', async (req,res)=>{
  const { username, password } = req.body || {};
  const user = await User.findOne({ username });
  if(!user) return res.status(401).json({ error:'Invalid' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if(!ok) return res.status(401).json({ error:'Invalid' });
  const token = jwt.sign({ role:'user', username }, cfg.JWT_SECRET, { expiresIn:'7d' });
  res.json({ ok:true, token, username, balance: user.balance });
});

export default r;
