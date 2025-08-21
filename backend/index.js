import express from "express";
import cors from "cors";
import connectDB from "./db.js";
import walletRoutes from "./routes/wallet.js";

const app = express();
app.use(express.json());
app.use(cors());

connectDB
