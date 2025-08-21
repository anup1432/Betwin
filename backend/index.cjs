const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// ✅ MongoDB connect
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected successfully"))
    .catch(err => console.error("MongoDB connection error:", err));

// ✅ Schemas
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true }
});
const User = mongoose.model("User", UserSchema);

const BetSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    amount: Number,
    type: String, // up or down
    result: { type: String, default: "Pending" }
});
const Bet = mongoose.model("Bet", BetSchema);

// ✅ Routes

// 1. Create User
app.post("/users", async (req, res) => {
    try {
        const user = new User({ username: req.body.username });
        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Place Bet
app.post("/bets", async (req, res) => {
    try {
        const { userId, amount, type } = req.body;
        const bet = new Bet({ userId, amount, type });
        await bet.save();
        res.json(bet);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Get All Bets
app.get("/bets", async (req, res) => {
    try {
        const bets = await Bet.find().populate("userId", "username");
        res.json(bets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
