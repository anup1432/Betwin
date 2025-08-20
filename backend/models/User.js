import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: { type: String },
  avatar: { type: String },
  balance: { type: Number, default: 100 },
  totalProfit: { type: Number, default: 0 },
  totalBets: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  suspended: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
