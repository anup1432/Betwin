import mongoose from "mongoose";

const betSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  round: { type: mongoose.Schema.Types.ObjectId, ref: 'Round' },
  direction: String,
  amount: Number,
  isBot: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Bet', betSchema);
