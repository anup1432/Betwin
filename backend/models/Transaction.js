import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: String, // deposit | withdraw
  amount: Number,
  address: String,
  status: { type: String, default: "pending" }, // approved/declined
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Transaction', transactionSchema);
