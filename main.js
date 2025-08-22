const canvas = document.getElementById('cryptoGraph');
const ctx = canvas.getContext('2d');
let data = [];
let current = 150;

// Graph
function generateGraph() {
    data = [];
    current = 150;
    for (let i = 0; i < 50; i++) {
        current += (Math.random() - 0.5) * 10;
        data.push(current);
    }
    drawGraph();
}
function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - data[0]);
    for (let i = 1; i < data.length; i++) {
        ctx.lineTo((canvas.width / data.length) * i, canvas.height - data[i]);
    }
    ctx.strokeStyle = '#4a90e2';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Game logic
document.getElementById('upBtn').addEventListener('click', () => makePrediction('up'));
document.getElementById('downBtn').addEventListener('click', () => makePrediction('down'));

function makePrediction(choice) {
    let last = data[data.length - 1];
    let next = last + (Math.random() - 0.5) * 20;
    let resultText = '';
    let stored = JSON.parse(localStorage.getItem('betwin_user'));
    if(!stored) { alert('Please login first!'); return; }
    if ((choice === 'up' && next > last) || (choice === 'down' && next < last)) {
        resultText = 'You Win! +10 USDT';
        stored.balance += 10;
    } else {
        resultText = 'You Lose! -10 USDT';
        stored.balance -= 10;
    }
    localStorage.setItem('betwin_user', JSON.stringify(stored));
    document.getElementById('result').innerText = resultText + ` | Balance: ${stored.balance} USDT`;
    data.push(next);
    if (data.length > 50) data.shift();
    drawGraph();
}

// Deposit / Withdraw (calls backend)
document.getElementById('depositBtn').addEventListener('click', async () => {
    const wallet = document.getElementById('wallet').value;
    const amount = parseFloat(document.getElementById('amount').value);
    if(!wallet || !amount){ alert('Enter wallet & amount'); return; }
    // Call backend /deposit API
    let res = await fetch('/backend/deposit', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({wallet, amount})
    });
    let data = await res.json();
    document.getElementById('walletResult').innerText = data.message;
});
document.getElementById('withdrawBtn').addEventListener('click', async () => {
    const wallet = document.getElementById('wallet').value;
    const amount = parseFloat(document.getElementById('amount').value);
    if(!wallet || !amount){ alert('Enter wallet & amount'); return; }
    // Call backend /withdraw API
    let res = await fetch('/backend/withdraw', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({wallet, amount})
    });
    let data = await res.json();
    document.getElementById('walletResult').innerText = data.message;
});

// Three doubts toggle
document.querySelectorAll('.toggle').forEach(btn => {
    btn.addEventListener('click', () => {
        const answer = btn.nextElementSibling;
        answer.style.display = answer.style.display === 'block' ? 'none' : 'block';
    });
});

generateGraph();
