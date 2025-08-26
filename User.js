import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  balance: { type: Number, default: 1000 }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
