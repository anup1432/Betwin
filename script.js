// ==========================
// GLOBAL STATE
// ==========================
let balance = parseFloat(localStorage.getItem("balance")) || 1; // Welcome bonus $1
let lastPrice = parseFloat(localStorage.getItem("lastPrice")) || 100;
let phase = localStorage.getItem("phase") || "betting";
let timer = parseInt(localStorage.getItem("timer")) || 20;
let bets = JSON.parse(localStorage.getItem("bets")) || { up: 0, down: 0 };

document.getElementById("balance").innerText = balance.toFixed(2);
document.getElementById("timer").innerText = timer;

// ==========================
// GRAPH SETUP
// ==========================
const ctx = document.getElementById("priceChart").getContext("2d");
let priceData = JSON.parse(localStorage.getItem("priceData")) || [lastPrice];
let labels = JSON.parse(localStorage.getItem("labels")) || [0];

const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: labels,
    datasets: [
      {
        label: "Price",
        data: priceData,
        borderColor: "lime",
        borderWidth: 2,
        fill: true,
        backgroundColor: "rgba(0,255,0,0.1)",
        tension: 0.3,
      },
    ],
  },
  options: {
    animation: false,
    plugins: { legend: { display: false } },
    scales: { x: { display: false }, y: { display: false } },
  },
});

// ==========================
// PRICE UPDATE
// ==========================
function updatePrice() {
  let change = (Math.random() - 0.5) * 2;
  lastPrice += change;
  priceData.push(lastPrice);
  labels.push(labels.length);

  if (priceData.length > 50) {
    priceData.shift();
    labels.shift();
  }

  chart.data.datasets[0].borderColor = change >= 0 ? "lime" : "red";
  chart.data.datasets[0].backgroundColor =
    change >= 0 ? "rgba(0,255,0,0.1)" : "rgba(255,0,0,0.1)";
  chart.update();

  localStorage.setItem("lastPrice", lastPrice);
  localStorage.setItem("priceData", JSON.stringify(priceData));
  localStorage.setItem("labels", JSON.stringify(labels));
}

// ==========================
// BET SYSTEM
// ==========================
function placeBet(type) {
  if (phase !== "betting") {
    alert("Betting closed! Wait for next round.");
    return;
  }
  if (balance < 1) {
    alert("Not enough balance!");
    return;
  }
  balance -= 1;
  bets[type] += 1;
  localStorage.setItem("balance", balance);
  localStorage.setItem("bets", JSON.stringify(bets));
  document.getElementById("balance").innerText = balance.toFixed(2);
}

// ==========================
// TIMER & GAME LOOP
// ==========================
setInterval(() => {
  timer--;
  if (timer < 0) {
    if (phase === "betting") {
      phase = "result";
      timer = 5;
      decideResult();
    } else {
      phase = "betting";
      timer = 20;
      bets = { up: 0, down: 0 };
      localStorage.setItem("bets", JSON.stringify(bets));
    }
  }
  document.getElementById("timer").innerText = timer;
  localStorage.setItem("timer", timer);
  localStorage.setItem("phase", phase);
}, 1000);

// ==========================
// RESULT LOGIC
// ==========================
function decideResult() {
  let result = Math.random() > 0.5 ? "up" : "down";

  if (bets[result] > 0) {
    balance += bets[result] * 2;
  }

  localStorage.setItem("balance", balance);
  document.getElementById("balance").innerText = balance.toFixed(2);
}

// ==========================
// EVENTS
// ==========================
document.getElementById("bet-up").addEventListener("click", () => placeBet("up"));
document.getElementById("bet-down").addEventListener("click", () => placeBet("down"));
setInterval(updatePrice, 1000);

// ==========================
// DEPOSIT / WITHDRAW (dummy)
// ==========================
function deposit() {
  let txn = prompt("Enter Transaction ID:");
  if (txn) {
    alert("Txn submitted! Wait for admin approval.");
  }
}

function withdraw() {
  if (balance < 5) {
    alert("Minimum $5 required for withdrawal!");
    return;
  }
  let addr = prompt("Enter your wallet address:");
  if (addr) {
    alert("Withdraw request submitted!");
  }
}
