// ---------------- STATE ----------------
let balance = parseFloat(localStorage.getItem("balance")) || 1; // $1 welcome bonus
document.getElementById("balance").innerText = balance.toFixed(2);

let bets = { up: 0, down: 0 };
let currentBet = null;
let roundTime = 20, resultTime = 5;
let timer = roundTime;
let inResult = false;

let price = 100;
let labels = [], data = [];

// ---------------- GRAPH ----------------
const ctx = document.getElementById("priceChart").getContext("2d");
let chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: labels,
    datasets: [{
      label: "Price",
      data: data,
      borderColor: "#00ff99",
      backgroundColor: "rgba(0,255,153,0.1)",
      borderWidth: 2,
      fill: true,
      tension: 0.3
    }]
  },
  options: {
    animation: false,
    scales: { x: { display: false }, y: { display: true } },
    plugins: { legend: { display: false } }
  }
});

function updatePrice() {
  let change = (Math.random() - 0.5) * 2; // -1 to +1
  price = Math.max(50, price + change);
  labels.push("");
  data.push(price);
  if (labels.length > 50) { labels.shift(); data.shift(); }
  chart.update();
}
setInterval(updatePrice, 1000);

// ---------------- TIMER ----------------
setInterval(() => {
  if (timer > 0) {
    timer--;
  } else {
    if (!inResult) {
      inResult = true;
      timer = resultTime;
      decideResult();
    } else {
      inResult = false;
      timer = roundTime;
      bets = { up: 0, down: 0 };
      document.getElementById("upBets").innerText = "0";
      document.getElementById("downBets").innerText = "0";
    }
  }
  document.getElementById("timer").innerText = timer;
}, 1000);

// ---------------- BETTING ----------------
function placeBet(direction, amount) {
  if (amount <= 0 || amount > balance) return alert("Invalid Bet!");
  balance -= amount;
  document.getElementById("balance").innerText = balance.toFixed(2);

  bets[direction] += amount;
  document.getElementById(direction + "Bets").innerText = bets[direction].toFixed(2);

  currentBet = { direction, amount };
  localStorage.setItem("balance", balance);
}

document.getElementById("upBtn").onclick = () => {
  let amt = parseFloat(document.getElementById("betAmount").value);
  placeBet("up", amt);
};
document.getElementById("downBtn").onclick = () => {
  let amt = parseFloat(document.getElementById("betAmount").value);
  placeBet("down", amt);
};

// ---------------- RESULT ----------------
function decideResult() {
  let resultDir = Math.random() > 0.5 ? "up" : "down"; // random winner
  if (currentBet && currentBet.direction === resultDir) {
    let winAmount = currentBet.amount * 2;
    balance += winAmount;
    alert("You Won! +" + winAmount);
  } else if (currentBet) {
    alert("You Lost! -" + currentBet.amount);
  }
  document.getElementById("balance").innerText = balance.toFixed(2);
  localStorage.setItem("balance", balance);
  currentBet = null;
}
