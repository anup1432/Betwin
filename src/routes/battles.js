import express from 'express';
import { Battle } from '../models/Battle.js';
import { createBattle, joinBattle } from '../engine.js';
import { requireUser } from '../middleware/userAuth.js';
import { requireAdmin } from '../middleware/adminAuth.js';

export const battles = express.Router();

battles.get('/', async (req,res)=>{
  const list = await Battle.find({}).sort({ createdAt: -1 }).limit(50);
  res.json(list);
});

battles.get('/:id', async (req,res)=>{
  const b = await Battle.findById(req.params.id);
  if (!b) return res.status(404).json({ error: 'Not found' });
  res.json(b);
});

battles.post('/', requireAdmin, async (req,res)=>{
  const { symbol='BTCUSDT', duration=60 } = req.body || {};
  const b = await createBattle({ symbol, duration: Number(duration) });
  res.json({ id: b._id, symbol: b.symbol, endAt: b.endAt });
});

battles.post('/:id/join', requireUser, async (req,res)=>{
  const { side } = req.body;
  try {
    const b = await joinBattle(req.params.id, { user: req.user.username, side });
    res.json({ ok: true, id: b._id });
  } catch (e) { res.status(400).json({ error: e.message }); }
});
