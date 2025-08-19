const mongoose = require('mongoose');
const BetSchema = new mongoose.Schema({
  userId: String,
  amount: Number,
  side: String, // 'up' or 'down'
  result: String,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Bet', BetSchema);
