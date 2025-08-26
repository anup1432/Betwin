import mongoose from "mongoose";

const botPredictionSchema = new mongoose.Schema({
  choice: { type: String, enum: ["UP", "DOWN"], required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("BotPrediction", botPredictionSchema);
