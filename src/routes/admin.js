import express from 'express';
import { requireAdmin } from '../middleware/adminAuth.js';
import { Battle } from '../models/Battle.js';
import { addBot } from '../engine.js';

export const admin = express.Router();
admin.use(requireAdmin);

admin.post('/bots/:id', async (req,res)=>{
  const { side } = req.body;
  try { await addBot(req.params.id, side); res.json({ ok:true }); }
  catch(e){ res.status(400).json({ error: e.message }); }
});

admin.post('/resolve/:id', async (req,res)=>{
  const b = await Battle.findById(req.params.id);
  if (!b) return res.status(404).json({ error:'Not found'});
  b.endAt = Date.now();
  await b.save();
  res.json({ ok:true });
});
