import mongoose from 'mongoose';
const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  balance: { type: Number, default: 0 },
  isAdmin: { type: Boolean, default: false },
}, { timestamps: true });
export const User = mongoose.model('User', UserSchema);
