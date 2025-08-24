/* ---------------- Market Battle + Deposit/Withdraw ---------------- */

/* --------------- Persistence keys --------------- */
const K = {
  BAL: 'mb_bal_v1',
  SERIES: 'mb_series_v1',
  EPOCH: 'mb_epoch_v1',
  ROUND: 'mb_round_v1',
  START_PRICE: 'mb_start_price_v1',
  UP_TOTAL: 'mb_up_total_v1',
  DOWN_TOTAL: 'mb_down_total_v1',
  MY_BETS: 'mb_my_bets_v1',
  DEPOSITS: 'mb_deposits_v1'
};

/* --------------- Config --------------- */
const BET_WINDOW = 20;
const RESULT_WINDOW = 5;
const CYCLE = BET_WINDOW + RESULT_WINDOW;
const BOT_MIN = 8, BOT_MAX = 20;
const BOT_MIN_AMT = 0.5, BOT_MAX_AMT = 25;

/* --------------- Helpers / DOM --------------- */
const $ = id => document.getElementById(id);
const fmt = n => Number(n).toFixed(2);
const now = () => Date.now();

/* Balance refs */
const balEl = $('balance'), roundEl = $('roundNum'), phaseEl = $('phase'),
timerEl = $('timer'), playersEl = $('players') || { textContent: '' },
upTotalEl = $('upTotal'), downTotalEl = $('downTotal'),
upBotsList = $('upBotsList'), downBotsList = $('downBotsList'),
activity = $('activity'), priceVal = $('priceVal'), priceArrow = $('priceArrow');

/* Backend API URL */
const API_URL = "https://betwin-backend.onrender.com";  // apna Render ka URL daalna

/* ----------------- Deposit / Withdraw Handling ----------------- */
document.getElementById("depositForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("depName").value.trim();
  const wallet = document.getElementById("depWallet").value;
  const amount = document.getElementById("depAmount").value.trim();

  if (!name || !wallet || !amount) {
    toast("⚠️ Fill all deposit fields");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/deposit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, wallet, amount })
    });
    const data = await res.json();
    if (res.ok) {
      toast("✅ Deposit submitted");
      e.target.reset();
      closeModal("depositModal");
    } else {
      toast("❌ Deposit failed: " + (data.error || "Server error"));
    }
  } catch (err) {
    console.error(err);
    toast("❌ Deposit server unreachable");
  }
});

document.getElementById("withdrawForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("withName").value.trim();
  const wallet = document.getElementById("withWallet").value.trim();
  const amount = document.getElementById("withAmount").value.trim();

  if (!name || !wallet || !amount) {
    toast("⚠️ Fill all withdrawal fields");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/withdraw`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, wallet, amount })
    });
    const data = await res.json();
    if (res.ok) {
      toast("✅ Withdrawal submitted");
      e.target.reset();
      closeModal("withdrawModal");
    } else {
      toast("❌ Withdraw failed: " + (data.error || "Server error"));
    }
  } catch (err) {
    console.error(err);
    toast("❌ Withdraw server unreachable");
  }
});

/* ----------------- Baaki pura Market Battle code as is ----------------- */
/* (Chart setup, Bots, Betting logic, Settlement, Activity log, etc.) */
/* Tera pura upar bheja hua code yaha jaisa hai waisa hi chodega. */
