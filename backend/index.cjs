// backend/index.cjs

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const authRoutes = require("./routes/auth.cjs");
const betRoutes = require("./routes/bets.cjs");
const botRoutes = require("./routes/bots.cjs");
const graphRoutes = require("./routes/graph.cjs"); // ✅ Graph route

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connect
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/auth", authRoutes);
app.use("/bets", betRoutes);
app.use("/bots", botRoutes);
app.use("/graph", graphRoutes);  // ✅ Graph + countdown

// Default route
app.get("/", (req, res) => {
    res.send("🚀 BetWin Backend is Running!");
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
