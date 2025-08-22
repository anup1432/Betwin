// index.cjs — BetWin REAL backend (CommonJS)
// Features: Global graph (server-driven), 20s bet + 5s result, round settlement,
// wallet/balance, bots, immutable username, recent bets/rounds APIs.

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ------------------ Mongo Schemas ------------------
const { Schema, model } = mongoose;

const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, index: true },
    balance: { type: Number, default: 0 },
    avatarUrl: { type: String, default: "" },
    isBot: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const RoundSchema = new Schema(
  {
    seq: { type: Number, index: true }, // 1,2,3...
    phase: { type: String, enum: ["betting", "result"], default: "betting" },
    startedAt: { type: Date, required: true },
    willLockAt: { type: Date, required: true }, // betting end
    willSettleAt: { type: Date, required: true }, // result publish
    startPrice: { type: Number, required: true },
    endPrice: { type: Number },
    outcome: { type: String, enum: ["up", "down", "flat"], default: "flat" },
    settled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const BetSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    usernameRef: { type: String, required: true }, // immutable snapshot
    roundSeq: { type: Number, required: true, index: true },
    amount: { type: Number, required: true, min: 1 },
    type: { type: String, enum: ["up", "down"], required: true },
    status: { type: String, enum: ["pending", "won", "lost"], default: "pending" },
    payout: { type: Number, default: 0 },
    isBot: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = model("User", UserSchema);
const Round = model("Round", RoundSchema);
const Bet = model("Bet", BetSchema);

// ------------------ Connect DB ------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((e) => console.error("❌ MongoDB connection error:", e));

// ------------------ Game Engine (in-memory + persisted rounds) ------------------
const BET_WINDOW = 20;  // seconds to place bet
const RESULT_WINDOW = 5; // seconds to display result
const TOTAL_WINDOW = BET_WINDOW + RESULT_WINDOW;

let currentPrice = 100; // base price
let priceSeries = [];   // last ~300 points
let currentSeq = 0;     // round sequence (persists across restarts via DB)
let ENGINE_STARTED = false;

// load last seq and bootstrap a round
async function bootstrapEngine() {
  if (ENGINE_STARTED) return;
  ENGINE_STARTED = true;

  // get last round to continue sequence
  const last = await Round.findOne().sort({ seq: -1 }).lean();
  currentSeq = last?.seq || 0;

  // create initial round if none active
  let active = await Round.findOne({ settled: false }).sort({ seq: -1 });
  if (!active) {
    await startNewRound();
  } else {
    // resume price baseline from last known
    if (active.startPrice) currentPrice = active.startPrice;
    tickGraph(); // start ticking right away
  }

  // start graph ticker (1s)
  setInterval(tickGraph, 1000);

  // start round phase manager (250ms granularity)
  setInterval(roundPhaseManager, 250);

  // ensure a few bot users exist
  await ensureBots();
}

function pushPricePoint() {
  const now = Date.now();
  priceSeries.push({ t: now, v: currentPrice });
  if (priceSeries.length > 300) priceSeries.shift();
}

function tickGraph() {
  // random walk: drift + noise
  const drift = (Math.random() - 0.5) * 0.6; // -0.3..0.3
  const shock = (Math.random() - 0.5) * 0.8; // -0.4..0.4
  currentPrice = Math.max(10, currentPrice + drift + shock);
  pushPricePoint();
}

async function startNewRound() {
  currentSeq += 1;
  const now = new Date();
  const willLockAt = new Date(now.getTime() + BET_WINDOW * 1000);
  const willSettleAt = new Date(now.getTime() + TOTAL_WINDOW * 1000);

  // start price is current price snapshot
  const round = await Round.create({
    seq: currentSeq,
    phase: "betting",
    startedAt: now,
    willLockAt,
    willSettleAt,
    startPrice: currentPrice,
    endPrice: null,
    outcome: "flat",
    settled: false,
  });

  // schedule some bot bets in this round
  scheduleBotBetsFor(round.seq);

  return round;
}

async function roundPhaseManager() {
  const round = await Round.findOne({ seq: currentSeq });
  if (!round) return;

  const now = Date.now();
  if (round.phase === "betting" && now >= round.willLockAt.getTime()) {
    // move to result phase
    round.phase = "result";
    await round.save();
  }

  if (round.phase === "result" && now >= round.willSettleAt.getTime() && !round.settled) {
    // settle round
    await settleRound(round);
    // start next round
    await startNewRound();
  }
}

async function settleRound(round) {
  const endPrice = currentPrice;
  round.endPrice = endPrice;

  let outcome = "flat";
  if (endPrice > round.startPrice) outcome = "up";
  else if (endPrice < round.startPrice) outcome = "down";
  round.outcome = outcome;

  // fetch bets for this round
  const bets = await Bet.find({ roundSeq: round.seq, status: "pending" });
  for (const bet of bets) {
    if (bet.type === outcome) {
      // WON: User already paid amount at placeBet; pay 2x (profit = amount)
      bet.status = "won";
      bet.payout = bet.amount * 2;
      await bet.save();

      await User.updateOne(
        { _id: bet.userId },
        { $inc: { balance: bet.payout } }
      );
    } else {
      bet.status = "lost";
      bet.payout = 0;
      await bet.save();
    }
  }

  round.settled = true;
  await round.save();
}

// ------------------ Bots ------------------
const BOT_NAMES = ["Bot_Alex", "Bot_Bravo", "Bot_Cypher", "Bot_Delta", "Bot_Echo"];
async function ensureBots() {
  for (const name of BOT_NAMES) {
    const exists = await User.findOne({ username: name });
    if (!exists) {
      await User.create({
        username: name,
        isBot: true,
        balance: 1_000_000,
        avatarUrl: `https://api.dicebear.com/6.x/bottts/svg?seed=${encodeURIComponent(name)}`
      });
    }
  }
}

function scheduleBotBetsFor(roundSeq) {
  // create 5–12 random bot bets across the betting window
  const n = 5 + Math.floor(Math.random() * 8);
  for (let i = 0; i < n; i++) {
    const delayMs = Math.floor(Math.random() * (BET_WINDOW - 2)) * 1000; // spread inside bet window
    setTimeout(async () => {
      const bots = await User.find({ isBot: true }).lean();
      if (!bots.length) return;
      const bot = bots[Math.floor(Math.random() * bots.length)];
      const type = Math.random() > 0.5 ? "up" : "down";
      const amount = 10 + Math.floor(Math.random() * 90); // 10..100
      // place bet only if round still betting
      const r = await Round.findOne({ seq: roundSeq });
      if (!r || r.phase !== "betting") return;
      await Bet.create({
        userId: bot._id,
        usernameRef: bot.username,
        roundSeq,
        amount,
        type,
        status: "pending",
        isBot: true,
      });
    }, delayMs);
  }
}

// ------------------ Helpers ------------------
function secondsLeft(ts) {
  const now = Date.now();
  return Math.max(0, Math.ceil((ts - now) / 1000));
}

// ------------------ APIs ------------------

// Health
app.get("/", (req, res) => {
  res.json({ ok: true, msg: "BetWin backend live", time: Date.now() });
});

// Create user (immutable username)
app.post("/users", async (req, res) => {
  try {
    const { username } = req.body || {};
    if (!username) return res.status(400).json({ error: "username required" });

    const existing = await User.findOne({ username });
    if (existing) return res.status(409).json({ error: "username taken" });

    const avatarUrl = `https://api.dicebear.com/6.x/pixel-art/svg?seed=${encodeURIComponent(
      username
    )}`;

    const user = await User.create({ username, balance: 0, avatarUrl });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get user + balance
app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ error: "user not found" });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Wallet: deposit (simple, immediate credit). For admin approval, add a key check.
app.post("/wallet/deposit", async (req, res) => {
  try {
    const { userId, amount } = req.body || {};
    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ error: "userId and positive amount required" });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "user not found" });

    user.balance += Number(amount);
    await user.save();
    res.json({ ok: true, balance: user.balance });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Wallet: withdraw (no negative)
app.post("/wallet/withdraw", async (req, res) => {
  try {
    const { userId, amount } = req.body || {};
    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ error: "userId and positive amount required" });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "user not found" });
    if (user.balance < amount) return res.status(400).json({ error: "insufficient balance" });

    user.balance -= Number(amount);
    await user.save();
    res.json({ ok: true, balance: user.balance });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Place bet (only during betting phase)
app.post("/bets", async (req, res) => {
  try {
    const { userId, amount, type } = req.body || {};
    if (!userId || !amount || amount <= 0 || !["up", "down"].includes(type)) {
      return res.status(400).json({ error: "userId, amount>0, type=up|down required" });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "user not found" });

    const round = await Round.findOne({ seq: currentSeq });
    if (!round || round.phase !== "betting") {
      return res.status(400).json({ error: "betting closed" });
    }

    if (user.balance < amount) return res.status(400).json({ error: "insufficient balance" });

    // Deduct immediately
    user.balance -= Number(amount);
    await user.save();

    const bet = await Bet.create({
      userId: user._id,
      usernameRef: user.username, // immutable reference
      roundSeq: round.seq,
      amount: Number(amount),
      type,
      status: "pending",
      isBot: !!user.isBot,
    });

    res.json({ ok: true, bet });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Recent bets (last 30)
app.get("/bets/recent", async (req, res) => {
  try {
    const bets = await Bet.find().sort({ createdAt: -1 }).limit(30).lean();
    res.json(bets);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Round status + countdown (global + consistent)
app.get("/round/status", async (req, res) => {
  try {
    const round = await Round.findOne({ seq: currentSeq }).lean();
    if (!round) return res.json({ loading: true });

    const now = Date.now();
    const remaining =
      round.phase === "betting"
        ? secondsLeft(new Date(round.willLockAt).getTime())
        : secondsLeft(new Date(round.willSettleAt).getTime());

    res.json({
      seq: round.seq,
      phase: round.phase,                // "betting" or "result"
      remaining,                         // seconds left in current phase
      betWindow: BET_WINDOW,
      resultWindow: RESULT_WINDOW,
      startPrice: round.startPrice,
      endPrice: round.endPrice || null,
      outcome: round.outcome || null,
      serverTime: now,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Graph data (same for all users)
app.get("/graph", (req, res) => {
  // return last N points (client can render line)
  res.json(priceSeries.slice(-200));
});

// Recent rounds (history)
app.get("/rounds/recent", async (req, res) => {
  try {
    const rounds = await Round.find().sort({ seq: -1 }).limit(20).lean();
    res.json(rounds);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ------------------ Start ------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  bootstrapEngine().catch((e) => console.error("Engine bootstrap error:", e));
});
