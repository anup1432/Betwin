// -------------------- GRAPH + GAME LOGIC --------------------
const ctx = document.getElementById("priceChart").getContext("2d");

// Load state from localStorage
let price = parseFloat(localStorage.getItem("price")) || 100;
let labels = JSON.parse(localStorage.getItem("labels")) || [];
let data = JSON.parse(localStorage.getItem("data")) || [];
let roundStartPrice = parseFloat(localStorage.getItem("roundStartPrice")) || price;

let chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: labels,
    datasets: [{
      label: "Price",
      data: data,
      borderColor: "#00ff99",
      borderWidth: 2,
      fill: true,
      backgroundColor: "rgba(0,255,153,0.1)",
      tension: 0.4
    }]
  },
  options: {
    animation: false,
    scales: { x: { display: false }, y: { display: true } },
    plugins: { legend: { display: false } }
  }
});

// -------------------- GAME STATE --------------------
let balance = localStorage.getItem("balance") ? parseFloat(localStorage.getItem("balance")) : 1; // $1 bonus
document.getElementById("balance").innerText = balance.toFixed(2);

let bets = JSON.parse(localStorage.getItem("bets")) || { up: 0, down: 0 };
document.getElementById("upBets").innerText = bets.up.toFixed(2);
document.getElementById("downBets").innerText = bets.down.toFixed(2);

let currentBet = JSON.parse(localStorage.getItem("currentBet")) || null;
let roundTime = 20; // 20s betting
let resultTime = 5; // 5s result
let timer = parseInt(localStorage.getItem("timer")) || roundTime;
let inResult = localStorage.getItem("inResult") === "true";

// -------------------- PRICE GENERATOR --------------------
function updatePrice() {
  let change = (Math.random() - 0.5) * 2; // random -1 to +1
  price = Math.max(50, price + change);
  labels.push("");
  data.push(price);

  if (labels.length > 50) {
    labels.shift();
    data.shift();
  }

  // Save state
  localStorage.setItem("price", price);
  localStorage.setItem("labels", JSON.stringify(labels));
  localStorage.setItem("data", JSON.stringify(data));

  chart.update();
}
setInterval(updatePrice, 1000);

// -------------------- TIMER --------------------
setInterval(() => {
  if (timer > 0) {
    timer--;
  } else {
    if (!inResult) {
      // betting phase over → show result
      inResult = true;
      timer = resultTime;
      decideResult();
    } else {
      // result phase over → new round
      inResult = false;
      timer = roundTime;
      roundStartPrice = price;
      bets = { up: 0, down: 0 };
      document.getElementById("upBets").innerText = "0";
      document.getElementById("downBets").innerText = "0";
    }
  }

  // Save timer state
  localStorage.setItem("timer", timer);
  localStorage.setItem("inResult", inResult);
  localStorage.setItem("roundStartPrice", roundStartPrice);
  localStorage.setItem("bets", JSON.stringify(bets));
  localStorage.setItem("currentBet", JSON.stringify(currentBet));

  document.getElementById("timer").innerText = timer + "s";
}, 1000);

// -------------------- BETTING --------------------
function placeBet(direction, amount) {
  if (amount <= 0 || amount > balance) return alert("Invalid bet amount!");
  balance -= amount;
  localStorage.setItem("balance", balance);
  document.getElementById("balance").innerText = balance.toFixed(2);

  bets[direction] += amount;
  document.getElementById(direction + "Bets").innerText = bets[direction].toFixed(2);

  currentBet = { direction, amount };
  localStorage.setItem("currentBet", JSON.stringify(currentBet));
}

document.getElementById("upBtn").onclick = () => {
  let amt = parseFloat(document.getElementById("betAmount").value);
  placeBet("up", amt);
};

document.getElementById("downBtn").onclick = () => {
  let amt = parseFloat(document.getElementById("betAmount").value);
  placeBet("down", amt);
};

// -------------------- RESULT --------------------
function decideResult() {
  let resultDir = price > roundStartPrice ? "up" : "down";
  if (currentBet && currentBet.direction === resultDir) {
    let winAmount = currentBet.amount * 2; // 2x payout
    balance += winAmount;
    alert("You Won! +" + winAmount.toFixed(2));
  } else if (currentBet) {
    alert("You Lost! -" + currentBet.amount.toFixed(2));
  }
  localStorage.setItem("balance", balance);
  document.getElementById("balance").innerText = balance.toFixed(2);

  currentBet = null;
  localStorage.setItem("currentBet", null);
}
