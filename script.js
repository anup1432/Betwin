// Balance System
let balance = 100;
const balanceEl = document.getElementById("balance");
const logList = document.getElementById("logList");

document.getElementById("addBalance").addEventListener("click", () => {
  balance += 50;
  updateBalance();
});

function deposit() {
  alert("Deposit your funds:\n\nBEP20: 0xE1D4b2BEC237AEDDB47da56b82b2f15812e45B44\nPolygon: 0xE1D4b2BEC237AEDDB47da56b82b2f15812e45B4\nTON: EQAj7vKLbaWjaNbAuAKP1e1HwmdYZ2vJ2xtWU8qq3JafkfxF");
}
function withdraw() {
  alert("Withdrawal request submitted!");
}

function updateBalance() {
  balanceEl.innerText = balance;
}

// Graph
const chart = LightweightCharts.createChart(document.getElementById("chart"), {
  width: window.innerWidth,
  height: 400,
  layout: { background: { color: '#111' }, textColor: '#ddd' },
  grid: { vertLines: { color: '#333' }, horzLines: { color: '#333' } }
});
const lineSeries = chart.addLineSeries({ color: '#4caf50' });

let time = 0;
let price = 100;
function updateGraph() {
  price += (Math.random() - 0.5) * 2;
  lineSeries.update({ time, value: price });
  time++;
}
setInterval(updateGraph, 1000);

// Auto Bot (always running)
function botAction() {
  const bet = Math.random() > 0.5 ? "UP" : "DOWN";
  const win = Math.random() < 0.3; // 30% win rate
  if (win) {
    balance += 10;
    addLog(`Bot bet ${bet} → WON (+10)`, "win");
  } else {
    balance -= 10;
    addLog(`Bot bet ${bet} → LOST (-10)`, "loss");
  }
  updateBalance();
}
setInterval(botAction, 4000); // every 4 sec bot bet karega

function addLog(message, type) {
  const li = document.createElement("li");
  li.textContent = message;
  li.className = type;
  logList.prepend(li);
}
