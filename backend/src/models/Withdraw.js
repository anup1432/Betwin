import mongoose from 'mongoose';
const WithdrawSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  address: { type: String },
  status: { type: String, enum: ['PENDING','APPROVED','REJECTED'], default: 'PENDING' }
}, { timestamps: true });
export const Withdraw = mongoose.model('Withdraw', WithdrawSchema);
