import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import Round from '../models/Round.js';
import Bet from '../models/Bet.js';

const router = express.Router();

router.get('/current', async (req,res)=>{
  // Always send the latest round (betting phase or last round)
  let round = await Round.findOne().sort({startAt:-1});
  if(!round || round.status === "settled") round = await Round.create({basePrice: (10000 + Math.random()*1000)});
  const upBets = await Bet.find({round: round._id, direction:"up"});
  const downBets = await Bet.find({round: round._id, direction:"down"});
  res.json({
    round: {
      id: round._id,
      basePrice: round.basePrice,
      status: round.status,
      upTotal: round.upTotal,
      downTotal: round.downTotal,
      upCount: round.upCount,
      downCount: round.downCount
    },
    upBets, downBets
  });
});

router.post('/bet', auth, async (req,res)=>{
  const { roundId, direction, amount } = req.body;
  if(!direction || !amount) return res.status(400).json({error:"Missing details"});
  const user = await User.findById(req.user.id);
  if(!user) return res.status(404).json({error:"User does not exist"});
  if(user.balance < amount) return res.status(400).json({error:"Insufficient balance"});
  const round = await Round.findById(roundId);
  if(!round || round.status !== "bet") return res.status(400).json({error:"Betting closed"});
  // Deduct balance
  user.balance -= amount;
  await user.save();
  // Add bet
  await Bet.create({user: user._id, round: round._id, direction, amount});
  // Update round totals
  if(direction==="up"){ round.upTotal += amount; round.upCount += 1;}
  else { round.downTotal += amount; round.downCount +=1;}
  await round.save();
  res.json({success:true, balance: user.balance});
});

router.get('/history', auth, async (req,res)=>{
  const bets = await Bet.find({user:req.user.id}).populate('round').sort({createdAt:-1}).limit(20);
  res.json({bets});
});

router.get('/leaderboard', async (req,res)=>{
  // Top 10 users by profit
  const users = await User.find().sort({totalProfit:-1}).limit(10).select('username avatar totalProfit');
  res.json({users});
});

export default router;
