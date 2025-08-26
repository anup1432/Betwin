import express from "express";
import { requireUser } from "../middleware/userAuth.js";
import { requireAdmin } from "../middleware/adminAuth.js";
import User from "../models/User.js";
import Deposit from "../models/Deposit.js";
import Withdraw from "../models/Withdraw.js";

const wallet = express.Router();

// User endpoints
wallet.post("/deposit-request", requireUser, async (req, res) => {
  const { amount, txHash } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });
  const deposit = await Deposit.create({ userId: req.user.id, amount, txHash });
  res.json({ ok: true, id: deposit._id });
});

wallet.post("/withdraw-request", requireUser, async (req, res) => {
  const { amount, address } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });
  const user = await User.findById(req.user.id);
  if (user.balance < amount) return res.status(400).json({ error: "Insufficient balance" });
  const withdraw = await Withdraw.create({ userId: req.user.id, amount, address });
  res.json({ ok: true, id: withdraw._id });
});

// Admin endpoints
wallet.get("/admin/deposits", requireAdmin, async (req, res) => {
  const list = await Deposit.find({ status: "PENDING" }).sort({ createdAt: 1 });
  res.json(list);
});

wallet.post("/admin/deposits/:id/approve", requireAdmin, async (req, res) => {
  const deposit = await Deposit.findById(req.params.id);
  if (!deposit || deposit.status !== "PENDING") return res.status(400).json({ error: "Invalid" });
  deposit.status = "APPROVED";
  await deposit.save();
  await User.findByIdAndUpdate(deposit.userId, { $inc: { balance: deposit.amount } });
  res.json({ ok: true });
});

wallet.post("/admin/deposits/:id/reject", requireAdmin, async (req, res) => {
  const deposit = await Deposit.findById(req.params.id);
  if (!deposit || deposit.status !== "PENDING") return res.status(400).json({ error: "Invalid" });
  deposit.status = "REJECTED";
  await deposit.save();
  res.json({ ok: true });
});

export default wallet;
