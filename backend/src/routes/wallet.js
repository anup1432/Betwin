import express from 'express';
import { requireUser } from '../middleware/userAuth.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import { Deposit } from '../models/Deposit.js';
import { Withdraw } from '../models/Withdraw.js';
import { User } from '../models/User.js';

export const wallet = express.Router();

// User endpoints
wallet.post('/deposit-request', requireUser, async (req,res)=>{
  const { amount, txHash } = req.body;
  if (!amount || amount<=0) return res.status(400).json({ error:'Invalid amount' });
  const d = await Deposit.create({ userId: req.user.id, amount, txHash });
  res.json({ ok:true, id: d._id });
});

wallet.post('/withdraw-request', requireUser, async (req,res)=>{
  const { amount, address } = req.body;
  if (!amount || amount<=0) return res.status(400).json({ error:'Invalid amount' });
  const u = await User.findById(req.user.id);
  if (u.balance < amount) return res.status(400).json({ error:'Insufficient balance' });
  const w = await Withdraw.create({ userId: req.user.id, amount, address });
  res.json({ ok:true, id: w._id });
});

wallet.get('/my/requests', requireUser, async (req,res)=>{
  const dep = await Deposit.find({ userId: req.user.id }).sort({ createdAt: -1 });
  const wid = await Withdraw.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json({ deposits: dep, withdrawals: wid });
});

// Admin endpoints
wallet.get('/admin/deposits', requireAdmin, async (req,res)=>{
  const list = await Deposit.find({ status: 'PENDING' }).sort({ createdAt: 1 });
  res.json(list);
});
wallet.post('/admin/deposits/:id/approve', requireAdmin, async (req,res)=>{
  const d = await Deposit.findById(req.params.id);
  if (!d || d.status!=='PENDING') return res.status(400).json({ error:'Invalid' });
  d.status = 'APPROVED';
  await d.save();
  await User.findByIdAndUpdate(d.userId, { $inc: { balance: d.amount } });
  res.json({ ok:true });
});
wallet.post('/admin/deposits/:id/reject', requireAdmin, async (req,res)=>{
  const d = await Deposit.findById(req.params.id);
  if (!d || d.status!=='PENDING') return res.status(400).json({ error:'Invalid' });
  d.status = 'REJECTED';
  await d.save();
  res.json({ ok:true });
});

wallet.get('/admin/withdrawals', requireAdmin, async (req,res)=>{
  const list = await Withdraw.find({ status: 'PENDING' }).sort({ createdAt: 1 });
  res.json(list);
});
wallet.post('/admin/withdrawals/:id/approve', requireAdmin, async (req,res)=>{
  const w = await Withdraw.findById(req.params.id);
  if (!w || w.status!=='PENDING') return res.status(400).json({ error:'Invalid' });
  const u = await User.findById(w.userId);
  if (u.balance < w.amount) return res.status(400).json({ error:'Insufficient user balance' });
  await User.findByIdAndUpdate(w.userId, { $inc: { balance: -w.amount } });
  w.status = 'APPROVED';
  await w.save();
  res.json({ ok:true });
});
wallet.post('/admin/withdrawals/:id/reject', requireAdmin, async (req,res)=>{
  const w = await Withdraw.findById(req.params.id);
  if (!w || w.status!=='PENDING') return res.status(400).json({ error:'Invalid' });
  w.status = 'REJECTED';
  await w.save();
  res.json({ ok:true });
});
