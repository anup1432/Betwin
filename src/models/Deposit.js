import mongoose from 'mongoose';
const DepositSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  txHash: { type: String },
  status: { type: String, enum: ['PENDING','APPROVED','REJECTED'], default: 'PENDING' }
}, { timestamps: true });
export const Deposit = mongoose.model('Deposit', DepositSchema);
