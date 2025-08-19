const express = require('express');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const router = express.Router();

router.get('/:userId', async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ balance: user.wallet });
});

router.post('/deposit', async (req, res) => {
  const { userId, amount } = req.body;
  const txn = new Transaction({ userId, amount, type: "deposit", status: "pending" });
  await txn.save();
  res.json({ message: "Deposit request submitted!", txn });
});

router.post('/withdraw', async (req, res) => {
  const { userId, amount } = req.body;
  const user = await User.findById(userId);
  if (!user || user.wallet < amount)
    return res.status(400).json({ error: "Insufficient balance" });
  const txn = new Transaction({ userId, amount, type: "withdraw", status: "pending" });
  await txn.save();
  res.json({ message: "Withdraw request submitted.", txn });
});

module.exports = router;
