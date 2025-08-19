const mongoose = require('mongoose');
const TransactionSchema = new mongoose.Schema({
  userId: String,
  type: String,
  amount: Number,
  status: String,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Transaction', TransactionSchema);
