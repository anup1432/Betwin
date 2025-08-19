const express = require('express');
const Bet = require('../models/Bet');
const User = require('../models/User');
const router = express.Router();

router.get('/', async (req, res) => {
  const pipeline = [
    { $match: { result: 'win' }},
    { $group: { _id: "$userId", winCount: { $sum: 1 }}},
    { $sort: { winCount: -1 }},
    { $limit: 10 }
  ];
  const top = await Bet.aggregate(pipeline);
  const userIds = top.map(x=>x._id);
  const users = await User.find({ _id: { $in: userIds }}).select('username');
  const leaderboard = top.map(row => ({
    username: users.find(u=>u._id.toString()===row._id.toString())?.username || "user",
    winCount: row.winCount
  }));
  res.json({ leaderboard });
});

module.exports = router;
