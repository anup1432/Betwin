// Fake price generator
let price = 100;
let priceHistory = [];
const canvas = document.getElementById("chartCanvas");
const ctx = canvas.getContext("2d");
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

function updatePrice() {
  const change = (Math.random() - 0.5) * 2;
  price += change;
  priceHistory.push(price);
  if (priceHistory.length > 50) priceHistory.shift();
  document.getElementById("livePrice").textContent = "$" + price.toFixed(2);
}
function drawChart() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.moveTo(0, canvas.height - priceHistory[0]);
  for (let i = 1; i < priceHistory.length; i++) {
    ctx.lineTo((i / priceHistory.length) * canvas.width, canvas.height - priceHistory[i]);
  }
  ctx.strokeStyle = "#0f0";
  ctx.stroke();
}

// Balance
let balance = parseFloat(localStorage.getItem("balance")) || 1.0;
document.getElementById("balance").textContent = balance.toFixed(2);

// Round system
let roundDuration = 20;
let resultDuration = 5;
let phase = "betting"; // or "result"
let timeLeft = roundDuration;

function roundLoop() {
  if (timeLeft <= 0) {
    if (phase === "betting") {
      phase = "result";
      timeLeft = resultDuration;
      document.getElementById("roundPhase").textContent = "Result Time!";
    } else {
      phase = "betting";
      timeLeft = roundDuration;
      document.getElementById("roundPhase").textContent = "Place your bets!";
      document.getElementById("upBets").innerHTML = "";
      document.getElementById("downBets").innerHTML = "";
    }
  }
  document.getElementById("roundTimer").textContent = timeLeft;
  timeLeft--;
}

setInterval(() => {
  updatePrice();
  drawChart();
}, 1000);

setInterval(roundLoop, 1000);

// Betting
document.getElementById("betUp").onclick = () => placeBet("up");
document.getElementById("betDown").onclick = () => placeBet("down");

function placeBet(side) {
  if (phase !== "betting") return alert("Betting closed!");
  let amt = parseFloat(document.getElementById("betAmount").value);
  if (!amt || amt <= 0 || amt > balance) return alert("Invalid amount");
  balance -= amt;
  localStorage.setItem("balance", balance);
  document.getElementById("balance").textContent = balance.toFixed(2);
  let li = document.createElement("li");
  li.textContent = "$" + amt.toFixed(2);
  document.getElementById(side + "Bets").appendChild(li);
  logActivity("Bet $" + amt + " on " + side.toUpperCase());
}

// Activity log
function logActivity(msg) {
  let li = document.createElement("li");
  li.textContent = msg;
  document.getElementById("activityLog").prepend(li);
}

// Deposit Modal
const depositModal = document.getElementById("depositModal");
document.getElementById("depositBtn").onclick = () => depositModal.classList.remove("hidden");
document.getElementById("closeDeposit").onclick = () => depositModal.classList.add("hidden");
document.getElementById("submitDeposit").onclick = () => {
  let txn = document.getElementById("txnId").value;
  if (!txn) return alert("Enter Transaction ID");
  logActivity("Deposit requested Txn: " + txn);
  alert("Admin will approve your deposit.");
  depositModal.classList.add("hidden");
};

// Withdraw Modal
const withdrawModal = document.getElementById("withdrawModal");
document.getElementById("withdrawBtn").onclick = () => withdrawModal.classList.remove("hidden");
document.getElementById("closeWithdraw").onclick = () => withdrawModal.classList.add("hidden");
document.getElementById("submitWithdraw").onclick = () => {
  let amt = parseFloat(document.getElementById("withdrawAmount").value);
  if (!amt || amt < 5) return alert("Min withdrawal $5");
  if (amt > balance) return alert("Not enough balance");
  balance -= amt;
  localStorage.setItem("balance", balance);
  document.getElementById("balance").textContent = balance.toFixed(2);
  logActivity("Withdraw requested $" + amt.toFixed(2));
  alert("Admin will approve your withdrawal.");
  withdrawModal.classList.add("hidden");
};
