import mongoose from "mongoose";

const roundSchema = new mongoose.Schema({
  startAt: { type: Date, default: Date.now },
  status: { type: String, default: "bet" }, // bet|settled
  basePrice: Number,
  upTotal: { type: Number, default: 0 },
  downTotal: { type: Number, default: 0 },
  upCount: { type: Number, default: 0 },
  downCount: { type: Number, default: 0 },
  outcome: { type: String }
});

export default mongoose.model('Round', roundSchema);
