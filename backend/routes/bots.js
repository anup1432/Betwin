import express from "express";
import BotPrediction from "../models/BotPrediction.js";

const bots = express.Router();

// Return last 50 predictions for live graph
bots.get("/history", async (req, res) => {
  const data = await BotPrediction.find().sort({ createdAt: 1 }).limit(50);
  res.json(data);
});

// Auto-generate bot predictions every 5 seconds
setInterval(async () => {
  const choice = Math.random() > 0.5 ? "UP" : "DOWN";
  await BotPrediction.create({ choice });
  console.log("Bot predicted:", choice);
}, 5000);

export default bots;
