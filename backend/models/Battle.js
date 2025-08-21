import mongoose from 'mongoose';
const PickSchema = new mongoose.Schema({ user: String, side: { type: String, enum: ['UP','DOWN'] } }, { _id:false });
const PointSchema = new mongoose.Schema({ t: Number, p: Number }, { _id:false });
const BattleSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  startAt: Number,
  endAt: Number,
  startPrice: Number,
  finished: { type: Boolean, default: false },
  points: [PointSchema],
  picks: [PickSchema],
  result: { endPrice: Number, change: Number, direction: String },
}, { timestamps: true });
export const Battle = mongoose.model('Battle', BattleSchema);
