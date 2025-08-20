// BETWIN - Crypto Prediction Game (GitHub + Firebase)
// Author: Anup1432

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getFirestore, doc, setDoc, getDoc, updateDoc, onSnapshot,
  collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// 1. Firebase Config (Edit to yours)
const firebaseConfig = {
  apiKey: "AIzaSyBR2YEkINKmbLAMvY3si0n3bE9zfS_bj3c",
  authDomain: "betwin-ae765.firebaseapp.com",
  projectId: "betwin-ae765",
  storageBucket: "betwin-ae765.appspot.com",
  messagingSenderId: "292357958400",
  appId: "1:292357958400:web:6818bdcf505ecef007a1e5"
};

// 2. Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 3. Game Configs
const GAME_CONFIG = {
  betWindow: 20,     // sec
  resultWindow: 5,   // sec
  feeRate: 0.02,     // 2%
  targetUserWinRate: 0.40,
  minBots: 8,
  maxBots: 16,
  minBet: 5,
  maxBet: 200
};

// 4. State
let state = {
  theme: localStorage.getItem("theme") || "dark",
  user: null,
  balance: 100.00,
  currentRoundId: null,
  currentPhase: "bet", // bet | result
  remaining: GAME_CONFIG.betWindow,
  selectedAmount: 10,
  chart: null,
  price: 10000, // synthetic
  priceChangePct: 0,
  myActiveBet: null,
  bots: [],
  avatars: [],
  isAdmin: false
};

// 5. DOM helpers
const $ = (id) => document.getElementById(id);
const format = (n) => Number(n).toFixed(2);

// 6. Avatar links (use your uploaded images!)
const BOT_AVATARS = [
  "assets/avatars/1000022214.jpg",
  "assets/avatars/1000022197.jpg",
  "assets/avatars/1000022379.jpg",
  "assets/avatars/1000022198.jpg",
  "assets/avatars/1000022200.jpg",
  "assets/avatars/1000022199.jpg",
  "assets/avatars/1000022201.jpg",
  "assets/avatars/1000022204.jpg",
  "assets/avatars/1000022202.jpg",
  "assets/avatars/1000022203.jpg"
];

// 7. Bootstrap on load
window.addEventListener("load", async () => {
  document.body.setAttribute("data-theme", state.theme);
  await ensureUser();
  initUI();
  initChart();
  loopTick();
  subscribeLeaderboard();
  subscribeHistory();
  setTimeout(() => $("#loadingScreen").style.display = "none", 600);
});

// 8. Anonymous User Auth
async function ensureUser() {
  let uid = localStorage.getItem("betwin_uid");
  if (!uid) {
    uid = crypto.randomUUID();
    localStorage.setItem("betwin_uid", uid);
    await setDoc(doc(db, "users", uid), {
      createdAt: serverTimestamp(),
      balance: state.balance,
      totalProfit: 0,
      totalBets: 0,
      wins: 0,
      losses: 0,
      suspended: false,
      name: "Player",
      avatar: BOT_AVATARS[Math.floor(Math.random() * BOT_AVATARS.length)]
    }, { merge: true });
  }
  const snap = await getDoc(doc(db, "users", uid));
  const data = snap.exists() ? snap.data() : {};
  state.user = { id: uid, ...data };
  state.balance = Number(data.balance ?? state.balance);
  $("#userBalance").innerText = format(state.balance);
  $("#userIdDisplay").innerText = uid.slice(0, 8);
  $("#profileName").innerText = data.name || "Player";
}

// 9. UI Basic Events
function initUI() {
  document.querySelectorAll(".bet-amount-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".bet-amount-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      state.selectedAmount = Number(btn.dataset.amount);
    });
  });
}

function setChartTimeframe() {} // placeholder
function filterHistory() {} // placeholder
function setLeaderboardPeriod() {} // placeholder

// 10. Chart
function initChart() {
  const ctx = $("#priceChart");
  const labels = new Array(60).fill("").map((_,i) => i);
  const data = new Array(60).fill(state.price);
  state.chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Price",
        data,
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.1)",
        tension: 0.35,
        pointRadius: 0,
        borderWidth: 2,
        fill: true
      }]
    },
    options: {
      responsive: true,
      animation: false,
      plugins: { legend: { display: false }},
      scales: {
        x: { display: false },
        y: {
          ticks: { color: "#9ca3af" },
          grid: { color: "rgba(148,163,184,0.1)" }
        }
      }
    }
  });
}

// 11. Price Simulator
function tickPrice() {
  const drift = 0.03, vol = 0.8, rnd = (Math.random()-0.5)*vol;
  state.price = Math.max(100, state.price + rnd + drift);
  const ds = state.chart.data.datasets[0].data;
  ds.push(state.price); ds.shift();
  state.chart.update();
  const last = ds[ds.length-1], prev = ds[ds.length-2];
  const pct = ((last - prev)/prev)*100;
  state.priceChangePct = pct;
  $("#priceChange").innerText = `${pct>=0?"+":""}${pct.toFixed(2)}%`;
  $("#priceChange").className = `price-change ${pct>=0?"positive":"negative"}`;
  $("#currentPrice").innerText = `$${last.toFixed(4)}`;
}

// 12. Game Loop
async function loopTick() {
  let roundStart = Date.now();
  await createNewRound();
  const tick = async () => {
    tickPrice();
    const elapsed = Math.floor((Date.now() - roundStart)/1000);
    if (state.currentPhase === "bet") {
      const remain = GAME_CONFIG.betWindow - elapsed;
      state.remaining = Math.max(0, remain);
      $("#timer").innerText = state.remaining;
      $("#gamePhase").innerText = "Betting Phase";
      $("#timerCircle").className = "timer-circle betting";
      toggleBetButtons(true);
      if (remain <= 0) {
        state.currentPhase = "result";
        roundStart = Date.now();
      }
    } else {
      const remain = GAME_CONFIG.resultWindow - elapsed;
      $("#timer").innerText = Math.max(0, remain);
      $("#gamePhase").innerText = "Result Phase";
      $("#timerCircle").className = "timer-circle result";
      toggleBetButtons(false);
      if (remain <= 0) {
        await finalizeRound();
        roundStart = Date.now();
        state.currentPhase = "bet";
        await createNewRound();
        state.myActiveBet = null;
      }
    }
    requestAnimationFrame(tick);
  };
  tick();
}

function toggleBetButtons(en) {
  $("#upBtn").disabled = !en;
  $("#downBtn").disabled = !en;
}

// 13. Rounds
async function createNewRound() {
  const ref = await addDoc(collection(db, "rounds"), {
    startAt: serverTimestamp(),
    status: "bet",
    basePrice: state.price,
    upTotal: 0,
    downTotal: 0,
    upCount: 0,
    downCount: 0
  });
  state.currentRoundId = ref.id;
  renderGroupStats(0,0,0,0);
  spawnBotsForRound();
}

function renderGroupStats(upAmount, downAmount, upPlayers, downPlayers) {
  $("#upAmount").innerText = format(upAmount);
  $("#downAmount").innerText = format(downAmount);
  $("#upPlayers").innerText = upPlayers;
  $("#downPlayers").innerText = downPlayers;
  $("#upPlayerCount").innerText = upPlayers;
  $("#downPlayerCount").innerText = downPlayers;
  $("#upPayout").innerText = (2*(1-GAME_CONFIG.feeRate)).toFixed(2) + "x";
  $("#downPayout").innerText = (2*(1-GAME_CONFIG.feeRate)).toFixed(2) + "x";
}

// 14. Place bet
window.placeBet = async function(direction) {
  if (state.currentPhase !== "bet") return toast("Betting closed");
  if (state.user?.suspended) return toast("Account suspended");
  const amt = Number(state.selectedAmount);
  if (!(amt>=GAME_CONFIG.minBet && amt<=10000)) return toast("Invalid amount");
  if (state.balance < amt) return toast("Insufficient balance");
  // Deduct immediately
  state.balance -= amt;
  $("#userBalance").innerText = format(state.balance);
  await updateDoc(doc(db, "users", state.user.id), { balance: state.balance });
  state.myActiveBet = { direction, amount: amt, roundId: state.currentRoundId };
  await addDoc(collection(db, "bets"), {
    uid: state.user.id,
    roundId: state.currentRoundId,
    direction,
    amount: amt,
    isBot: false,
    createdAt: serverTimestamp()
  });
  await updateRoundTotals(direction, amt);
  addAvatar(direction, state.user.avatar);
  toast(`Bet placed: ${direction.toUpperCase()} $${amt}`);
};

// 15. Update round totals (local + cloud)
async function updateRoundTotals(direction, amt) {
  const rref = doc(db, "rounds", state.currentRoundId);
  const snap = await getDoc(rref);
  const r = snap.data() || {};
  const upAmount = Number(r.upTotal || 0) + (direction==="up"?amt:0);
  const downAmount = Number(r.downTotal || 0) + (direction==="down"?amt:0);
  const upCount = Number(r.upCount || 0) + (direction==="up"?1:0);
  const downCount = Number(r.downCount || 0) + (direction==="down"?1:0);
  renderGroupStats(upAmount, downAmount, upCount, downCount);
  await updateDoc(rref, {
    upTotal: upAmount, downTotal: downAmount,
    upCount, downCount
  });
}

// 16. Bots
function spawnBotsForRound() {
  state.bots = [];
  const n = randInt(GAME_CONFIG.minBots, GAME_CONFIG.maxBots);
  for (let i=0;i<n;i++) {
    const delay = randInt(0, GAME_CONFIG.betWindow*1000-2000);
    setTimeout(async () => {
      const dir = Math.random() < 0.5 ? "up" : "down";
      const amt = randInt(GAME_CONFIG.minBet, GAME_CONFIG.maxBet);
      const avatar = BOT_AVATARS[randInt(0, BOT_AVATARS.length-1)];
      state.bots.push({dir, amt, avatar});
      addAvatar(dir, avatar);
      await addDoc(collection(db, "bets"), {
        uid: "bot_"+i+"_"+state.currentRoundId,
        roundId: state.currentRoundId,
        direction: dir,
        amount: amt,
        isBot: true,
        createdAt: serverTimestamp()
      });
      await updateRoundTotals(dir, amt);
    }, delay);
  }
}

function addAvatar(direction, avatarUrl) {
  const el = document.createElement("img");
  el.src = avatarUrl;
  el.className = "avatar";
  if (direction==="up") $("#upPlayerAvatars").appendChild(el);
  else $("#downPlayerAvatars").appendChild(el);
}

// 17. Finalize round
async function finalizeRound() {
  const rref = doc(db, "rounds", state.currentRoundId);
  const rs = await getDoc(rref);
  const r = rs.data() || { upTotal:0, downTotal:0, upCount:0, downCount:0 };
  const totalUp = Number(r.upTotal||0);
  const totalDown = Number(r.downTotal||0);
  let outcome;
  // Slight bias: if user money >, house wins 60% time
  const betsQ = query(collection(db, "bets"));
  const snap = await getDocs(betsQ);
  let userUp=0, userDown=0;
  snap.forEach(b=>{
    const d=b.data();
    if (d.roundId!==state.currentRoundId || d.isBot) return;
    if (d.direction==="up") userUp+=Number(d.amount); else userDown+=Number(d.amount);
  });
  const biasDown = userUp>userDown ? 0.6 : 0.4;
  const roll = Math.random();
  if (userUp>userDown) outcome = roll < biasDown ? "down":"up";
  else outcome = roll < (1-biasDown) ? "up":"down";
  await updateDoc(rref, { status: "settled", outcome, endAt: serverTimestamp() });

  // Payouts (2x minus fee)
  const winners = [];
  const q = query(collection(db, "bets"));
  const all = await getDocs(q);
  for (const b of all.docs) {
    const d = b.data();
    if (d.roundId!==state.currentRoundId || d.isBot) continue;
    const win = d.direction===outcome;
    const uref = doc(db, "users", d.uid);
    const us = await getDoc(uref);
    const u = us.exists()? us.data(): {};
    let bal = Number(u.balance||0);
    if (win) {
      const gross = d.amount*2;
      const fee = d.amount*GAME_CONFIG.feeRate;
      const payout = gross - fee;
      bal += payout;
      winners.push({uid:d.uid, payout});
      await setDoc(doc(db, "history", crypto.randomUUID()), {
        uid:d.uid, roundId: state.currentRoundId, amount:d.amount,
        outcome, result:"win", payout, fee, createdAt: serverTimestamp()
      });
      await updateDoc(uref, {
        balance: bal,
        totalProfit: Number(u.totalProfit||0) + (payout - d.amount),
        totalBets: Number(u.totalBets||0)+1,
        wins: Number(u.wins||0)+1
      });
      if (d.uid===state.user.id) {
        state.balance = bal;
        showWinPopup(payout);
      }
    } else {
      await setDoc(doc(db, "history", crypto.randomUUID()), {
        uid:d.uid, roundId: state.currentRoundId, amount:d.amount,
        outcome, result:"loss", payout:0, fee:0, createdAt: serverTimestamp()
      });
      await updateDoc(uref, {
        balance: bal,
        totalBets: Number(u.totalBets||0)+1,
        losses: Number(u.losses||0)+1
      });
    }
  }
  $("#upPlayerAvatars").innerHTML = "";
  $("#downPlayerAvatars").innerHTML = "";
  renderGroupStats(0,0,0,0);
}

// 18. History and leaderboard (live)
function subscribeHistory() {
  const qh = query(collection(db, "history"), orderBy("createdAt","desc"), limit(30));
  onSnapshot(qh, (snap)=>{
    const list = $("#historyList");
    list.innerHTML = "";
    let has = false;
    snap.forEach(d=>{
      const h=d.data();
      if (h.uid!==state.user.id) return;
      has = true;
      const row = document.createElement("div");
      row.className = "history-item";
      row.innerHTML = `
        <div>
          <div class="font-bold">${h.result.toUpperCase()}</div>
          <div class="text-muted">Round: ${h.roundId.slice(0,6)}</div>
        </div>
        <div>$${format(h.amount)}</div>
        <div style="color:${h.result==='win'?'#22c55e':'#ef4444'}">
          ${h.result==='win'?'+$'+format(h.payout - h.amount):'-$'+format(h.amount)}
        </div>`;
      list.appendChild(row);
    });
    if (!has) {
      list.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><h3>No betting history</h3><p>Start making predictions to see your history here.</p></div>`;
    }
  });
}

function subscribeLeaderboard() {
  const ql = query(collection(db, "users"));
  onSnapshot(ql, (snap)=>{
    const arr = [];
    snap.forEach(d=>{
      const u=d.data();
      if (u.suspended) return;
      arr.push({
        name: u.name || "Player",
        profit: Number(u.totalProfit||0),
        avatar: u.avatar || ""
      });
    });
    arr.sort((a,b)=>b.profit-a.profit);
    const top = arr.slice(0,20);
    const list = $("#leaderboardList");
    list.innerHTML = "";
    top.forEach((u,i)=>{
      const row = document.createElement("div");
      row.className = "leaderboard-item";
      row.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px">
          <img src="${u.avatar}" class="avatar" />
          <div><div class="font-bold">#${i+1} ${u.name}</div>
          <div class="text-muted">Profit</div></div>
        </div>
        <div style="color:#f59e0b;font-weight:800">$${format(u.profit)}</div>`;
      list.appendChild(row);
    });
  });
}

// 19. UI Actions & Modals
window.setCustomAmount = () => {
  const v = Number($("#customAmount").value);
  if (v>=GAME_CONFIG.minBet) {
    state.selectedAmount = v;
    document.querySelectorAll(".bet-amount-btn").forEach(b=>b.classList.remove("selected"));
    toast("Custom amount set");
  } else toast("Enter valid amount");
};
window.showDepositModal = () => showModal("depositModal");
window.showWithdrawModal = () => showModal("withdrawModal");
window.showContact = () => showModal("contactModal");
window.copyAddress = (addr) => { navigator.clipboard.writeText(addr); toast("Address copied!"); };
function showModal(id){ $(id).classList.add("show"); }
window.closeModal = (id)=> $(id).classList.remove("show");

// 20. Deposits/Withdrawals (requests)
window.submitWithdrawal = async () => {
  const amt = Number($("#withdrawAmount").value);
  const type = $("#withdrawCrypto").value;
  const addr = $("#withdrawAddress").value.trim();
  if (amt<10 || !addr) return toast("Enter valid details");
  await addDoc(collection(db, "withdrawals"), {
    uid: state.user.id, amount: amt, type, address: addr,
    status: "pending", createdAt: serverTimestamp()
  });
  toast("Withdrawal request submitted");
  closeModal("withdrawModal");
};

// 21. Theme
window.toggleTheme = () => {
  state.theme = state.theme==="dark"?"light":"dark";
  document.body.setAttribute("data-theme", state.theme);
  localStorage.setItem("theme", state.theme);
};

// 22. Admin Panel
const ADMIN = { username: "anup1432", password: "@nup1432" };
window.showMenu = () => {
  const isAdmin = prompt("Enter 'admin' to open admin panel, or leave blank to cancel");
  if (isAdmin && isAdmin.toLowerCase()==="admin") {
    const u = prompt("Username:");
    const p = prompt("Password:");
    if (u===ADMIN.username && p===ADMIN.password) {
      state.isAdmin = true;
      showAdmin();
    } else toast("Invalid admin credentials");
  }
};

function showAdmin(){
  loadAdminData();
  showModal("adminModal");
}

async function loadAdminData(){
  const usersSnap = await getDocs(collection(db, "users"));
  const txSnap = await getDocs(collection(db, "withdrawals"));
  let totalUsers=0, volume=0;
  usersSnap.forEach(u=>{
    totalUsers++;
    volume += Number(u.data().totalBets||0);
  });
  $("#adminTotalUsers").innerText = totalUsers;
  $("#adminActiveGames").innerText = 1;
  $("#adminTotalVolume").innerText = "$"+format(volume);

  const usersList = [];
  usersSnap.forEach(u=>{usersList.push({id:u.id, ...u.data()});});
  const usersDiv = $("#adminUsersList");
  usersDiv.innerHTML = "";
  usersList.forEach(u=>{
    const row = document.createElement("div");
    row.className = "history-item";
    row.innerHTML = `
      <div><div class="font-bold">${u.name || "Player"}</div><div>${u.id.slice(0,8)}</div></div>
      <div>$${format(u.balance||0)}</div>
      <div>
        <button class="submit-btn" style="padding:6px 10px" onclick="toggleSuspend('${u.id}', ${u.suspended?0:1})">
          ${u.suspended?"Unban":"Suspend"}
        </button>
      </div>`;
    usersDiv.appendChild(row);
  });

  const txDiv = $("#adminTransactionsList");
  txDiv.innerHTML = "";
  txSnap.forEach(t=>{
    const d=t.data();
    const row = document.createElement("div");
    row.className = "history-item";
    row.innerHTML = `
      <div><div class="font-bold">Withdraw</div><div>${t.id.slice(0,6)}</div></div>
      <div>$${format(d.amount)}</div>
      <div>${d.status}</div>
      <div>
        <button class="submit-btn" style="padding:6px 10px" onclick="approveWithdraw('${t.id}', ${d.amount})">Approve</button>
      </div>`;
    txDiv.appendChild(row);
  });
}

window.toggleSuspend = async (uid, flag) => {
  await updateDoc(doc(db, "users", uid), { suspended: !!flag });
  toast(flag? "User suspended":"User unbanned");
  loadAdminData();
};
window.approveWithdraw = async (wid, amount) => {
  await updateDoc(doc(db, "withdrawals", wid), { status: "approved" });
  toast("Withdrawal approved");
  loadAdminData();
};

// 23. Helpers
function toast(msg){
  const div = document.createElement("div");
  div.style.position="fixed";
  div.style.bottom="20px";
  div.style.left="50%";
  div.style.transform="translateX(-50%)";
  div.style.background="#111827";
  div.style.color="#fff";
  div.style.padding="10px 16px";
  div.style.borderRadius="10px";
  div.style.boxShadow="0 10px 30px rgba(0,0,0,.3)";
  div.style.zIndex=99999;
  div.innerText = msg;
  document.body.appendChild(div);
  setTimeout(()=>div.remove(), 1700);
}

function showWinPopup(payout){
  $("#winnerAmount").innerText = format(payout);
  $("#winnerAnnouncement").style.display = "block";
  setTimeout(()=>$("#winnerAnnouncement").style.display="none", 2000);
}

function randInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
            
