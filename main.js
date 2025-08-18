const graphCanvas = document.getElementById('graphCanvas');
const ctx = graphCanvas.getContext('2d');
const graphNumber = document.getElementById('graphNumber');
const balanceSpan = document.getElementById('balance');
const messageDiv = document.getElementById('message');
const betAmountInput = document.getElementById('betAmount');

let balance = 1000;
let graphValue = 100;
let graphDirectionUp = true;
let betPlaced = false;
let betSide = null;
let betAmount = 0;

function resizeCanvas() {
  graphCanvas.width = graphCanvas.clientWidth;
  graphCanvas.height = graphCanvas.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const graphHistory = [graphValue];
const maxPoints = 50;

function drawGraph() {
  ctx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
  const w = graphCanvas.width;
  const h = graphCanvas.height;
  ctx.beginPath();
  ctx.lineWidth = 3;
  ctx.strokeStyle = graphDirectionUp ? '#2ecc40' : '#ff4136';

  const length = graphHistory.length;
  const sliceStart = length > maxPoints ? length - maxPoints : 0;
  const points = graphHistory.slice(sliceStart);

  const maxVal = Math.max(...points);
  const minVal = Math.min(...points);
  const rangeVal = maxVal - minVal || 1;

  for (let i = 0; i < points.length; i++) {
    const x = (w / (maxPoints - 1)) * i;
    const y = h - ((points[i] - minVal) / rangeVal) * h;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  graphNumber.textContent = graphValue.toFixed(2);
  graphNumber.className = 'graph-number ' + (graphDirectionUp ? 'graph-up' : 'graph-down');
}

function updateGraph() {
  graphDirectionUp = Math.random() > 0.5;
  const change = (Math.random() * 5) + 1;
  graphValue += graphDirectionUp ? change : -change;
  graphHistory.push(graphValue);

  if (graphHistory.length > 100) graphHistory.shift();

  drawGraph();

  if (betPlaced) {
    if ((betSide === 'up' && graphDirectionUp) || (betSide === 'down' && !graphDirectionUp)) {
      const winnings = betAmount * 2 * 0.98; // 2% fee
      balance += winnings;
      messageDiv.textContent = `You won ${winnings.toFixed(2)} USDT!`;
    } else {
      messageDiv.textContent = `You lost ${betAmount.toFixed(2)} USDT!`;
    }
    betPlaced = false;
    betSide = null;
    betAmount = 0;
    balanceSpan.textContent = balance.toFixed(2);
    betAmountInput.max = balance.toFixed(2);
  } else {
    messageDiv.textContent = '';
  }
}

setInterval(updateGraph, 5000);

function placeBet(side) {
  if (betPlaced) {
    alert('Wait for the next round!');
    return;
  }
  betAmount = parseFloat(betAmountInput.value);
  if (isNaN(betAmount) || betAmount <= 0 || betAmount > balance) {
    alert('Invalid bet amount!');
    return;
  }
  balance -= betAmount;
  balanceSpan.textContent = balance.toFixed(2);
  betSide = side;
  betPlaced = true;
  messageDiv.textContent = `Bet placed on ${side.toUpperCase()}. Wait for result!`;
  betAmountInput.value = '';
}

function toggleTheme() {
  document.body.classList.toggle('light');
}

drawGraph();
