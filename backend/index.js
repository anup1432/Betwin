import express from "express";
import cors from "cors";
import connectDB from "./db.js";

import authRoutes from "./routes/auth.js";
import battleRoutes from "./routes/battles.js";
import adminRoutes from "./routes/admin.js";
import walletRoutes from "./routes/wallet.js";

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect Database
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/battles", battleRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/wallet", walletRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("✅ BetWin Backend Running...");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
