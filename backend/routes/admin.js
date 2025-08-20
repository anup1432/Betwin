import express from 'express';
import User from '../models/User.js';
import Round from '../models/Round.js';
import Bet from '../models/Bet.js';

const router = express.Router();

const ADMIN_KEY = "ReplaceWithStrongSecretInProduction";

router.get('/users', async (req,res) => {
  if(req.query.key !== ADMIN_KEY) return res.status(401).json({error:"Unauthorized"});
  const users = await User.find().limit(100);
  res.json({users});
});

router.post('/suspend', async (req,res)=>{
  if(req.body.key !== ADMIN_KEY) return res.status(401).json({error:"Unauthorized"});
  await User.findByIdAndUpdate(req.body.id, {suspended:true});
  res.json({success:true});
});

router.get('/stats', async (req,res)=>{
  if(req.query.key !== ADMIN_KEY) return res.status(401).json({error:"Unauthorized"});
  const userCount = await User.countDocuments();
  const totalBets = await Bet.countDocuments();
  const rounds = await Round.countDocuments();
  res.json({userCount, totalBets, rounds});
});

export default router;
