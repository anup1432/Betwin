const express = require('express');
const Bet = require('../models/Bet');
const User = require('../models/User');
const router = express.Router();

router.post('/', async (req, res) => {
  const { userId, amount, side } = req.body;
  const user = await User.findById(userId);
  if (!user || user.wallet < amount)
    return res.status(400).json({ error: 'Insufficient balance' });
  user.wallet -= amount;
  const win = Math.random() > 0.5;
  if (win) user.wallet += amount * 1.98;
  await user.save();
  const bet = new Bet({ userId, amount, side, result: win ? 'win' : 'lose' });
  await bet.save();
  res.json({ win, wallet: user.wallet, bet });
});

module.exports = router;
