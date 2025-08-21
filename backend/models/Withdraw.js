import mongoose from "mongoose";

const withdrawSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  address: { type: String, required: true },
  status: { type: String, enum: ["PENDING","APPROVED","REJECTED"], default: "PENDING" },
}, { timestamps: true });

export default mongoose.model("Withdraw", withdrawSchema);
