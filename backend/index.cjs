// backend/index.cjs

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Routes
import authRoutes from "./routes/auth.js";
import betRoutes from "./routes/bets.js";
import botRoutes from "./routes/bots.js";
import graphRoutes from "./routes/graph.js"; // ✅ NEW graph route

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connect
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

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
