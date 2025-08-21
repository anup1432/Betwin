import express from "express";
import { requireUser } from "../middleware/userAuth.js";
import { requireAdmin } from "../middleware/adminAuth.js";
import Deposit from "../models/Deposit.js";
import Withdraw from "../models/Withdraw.js";
import User from "../models/User.js";

const wallet = express.Router();

// ----------------- User Endpoints -----------------

// Deposit request
wallet.post("/deposit-request", requireUser, async (req, res) => {
  const { amount, txHash } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });

  const deposit = await Deposit.create({ userId: req.user.id, amount, txHash });
  res.json({ ok: true, id: deposit._id });
});

// Withdraw request
wallet.post("/withdraw-request", requireUser, async (req, res) => {
  const { amount, address } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });

  const user = await User.findById(req.user.id);
  if (user.balance < amount) return res.status(400).json({ error: "Insufficient balance" });

  const withdraw = await Withdraw.create({ userId: req.user.id, amount, address });
  res.json({ ok: true, id: withdraw._id });
});

// Get user requests
wallet.get("/my/requests", requireUser, async (req, res) => {
  const deposits = await Deposit.find({ userId: req.user.id }).sort({ createdAt: -1 });
  const withdrawals = await Withdraw.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json({ deposits, withdrawals });
});

// ----------------- Admin Endpoints -----------------

// Get pending deposits
wallet.get("/admin/deposits", requireAdmin, async (req, res) => {
  const list = await Deposit.find({ status: "PENDING" }).sort({ createdAt: 1 });
  res.json(list);
});

// Approve deposit
wallet.post("/admin/deposits/:id/approve", requireAdmin, async (req, res) => {
  const deposit = await Deposit.findById(req.params.id);
  if (!deposit || deposit.status !== "PENDING") return res.status(400).json({ error: "Invalid" });

  deposit.status = "APPROVED";
  await deposit.save();
  await User.findByIdAndUpdate(deposit.userId, { $inc: { balance: deposit.amount } });
  res.json({ ok: true });
});

// Reject deposit
wallet.post("/admin/deposits/:id/reject", requireAdmin, async (req, res) => {
  const deposit = await Deposit.findById(req.params.id);
  if (!deposit || deposit.status !== "PENDING") return res.status(400).json({ error: "Invalid" });

  deposit.status = "REJECTED";
  await deposit.save();
  res.json({ ok: true });
});

// Get pending withdrawals
wallet.get("/admin/withdrawals", requireAdmin, async (req, res) => {
  const list = await Withdraw.find({ status: "PENDING" }).sort({ createdAt: 1 });
  res.json(list);
});

// Approve withdrawal
wallet.post("/admin/withdrawals/:id/approve", requireAdmin, async (req, res) => {
  const withdraw = await Withdraw.findById(req.params.id);
  if (!withdraw || withdraw.status !== "PENDING") return res.status(400).json({ error: "Invalid" });

  const user = await User.findById(withdraw.userId);
  if (user.balance < withdraw.amount) return res.status(400).json({ error: "Insufficient user balance" });

  await User.findByIdAndUpdate(withdraw.userId, { $inc: { balance: -withdraw.amount } });
  withdraw.status = "APPROVED";
  await withdraw.save();
  res.json({ ok: true });
});

// Reject withdrawal
wallet.post("/admin/withdrawals/:id/reject", requireAdmin, async (req, res) => {
  const withdraw = await Withdraw.findById(req.params.id);
  if (!withdraw || withdraw.status !== "PENDING") return res.status(400).json({ error: "Invalid" });

  withdraw.status = "REJECTED";
  await withdraw.save();
  res.json({ ok: true });
});

export default wallet;
