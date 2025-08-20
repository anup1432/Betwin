import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

router.post('/register', async (req,res)=>{
  const { username, password, avatar } = req.body;
  if(!username || !password) return res.status(400).json({error:"Missing fields"});
  const hash = await bcrypt.hash(password, 10);
  try {
    const usr = await User.create({ username, password: hash, avatar });
    res.json({success:true});
  } catch {
    res.status(409).json({error:"User exists"});
  }
});

router.post('/login', async (req,res)=>{
  const { username, password } = req.body;
  const usr = await User.findOne({username});
  if(!usr) return res.status(404).json({error:"Not found"});
  if(!await bcrypt.compare(password, usr.password)) return res.status(401).json({error:"Wrong password"});
  const token = jwt.sign({ id: usr._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { username: usr.username, balance: usr.balance, avatar: usr.avatar } });
});

router.get('/profile', async (req,res)=>{
  // Add JWT auth check if needed
  if(!req.header('Authorization')) return res.status(401).json({error:"No token"});
  try{
    const decoded = jwt.verify(req.header('Authorization').replace('Bearer ',''), process.env.JWT_SECRET);
    const usr = await User.findById(decoded.id);
    if(!usr) return res.status(404).json({error:"Not found"});
    res.json({ user: { username: usr.username, balance: usr.balance, avatar: usr.avatar } });
  }catch{res.status(401).json({error:"Invalid token"});}
});

export default router;
