import mongoose from "mongoose";
import { cfg } from "./config.js";

const connectDB = async () => {
  try {
    await mongoose.connect(cfg.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

export default connectDB;
