const canvas = document.getElementById("chart");
const ctx = canvas.getContext("2d");
canvas.width = 600;
canvas.height = 300;

let balance = 1000;
let bet = null;

// Draw fake moving line
function drawChart(win) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.moveTo(0, 150);
  for (let x = 0; x < canvas.width; x += 20) {
    let y = 150 + Math.sin(x / 40) * 40;
    ctx.lineTo(x, y);
  }
  ctx.strokeStyle = win ? "lime" : "red";
  ctx.lineWidth = 2;
  ctx.stroke();
}

document.getElementById("betUp").addEventListener("click", () => {
  bet = "UP";
  playRound();
});
document.getElementById("betDown").addEventListener("click", () => {
  bet = "DOWN";
  playRound();
});

function playRound() {
  if (!bet) return;
  const win = Math.random() > 0.5; // 50/50
  drawChart(win);
  let resultText = "";

  if ((bet === "UP" && win) || (bet === "DOWN" && !win)) {
    balance += 100;
    resultText = "You Won!";
  } else {
    balance -= 100;
    resultText = "You Lost!";
  }

  document.getElementById("balance").textContent = balance;
  document.getElementById("result").textContent = resultText;

  bet = null; // reset
}

drawChart(true);
