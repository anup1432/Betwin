// backend/routes/battles.js
import express from "express";
const router = express.Router();

// Example: Start a new battle
router.post("/start", (req, res) => {
  res.json({ message: "Battle started!" });
});

// Example: Join a battle
router.post("/join", (req, res) => {
  res.json({ message: "Joined the battle!" });
});

// Example: Get battle results
router.get("/results", (req, res) => {
  res.json({ message: "Battle results here!" });
});

export default router;
