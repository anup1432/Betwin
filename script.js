const API_BASE = "https://betwin-winn.onrender.com";
let currentUserId = null;
let chart = null;

// ------------------ User ------------------
async function createUser() {
    const username = document.getElementById("username").value;
    if (!username) return alert("Enter username");

    try {
        const res = await fetch(`${API_BASE}/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username })
        });
        const data = await res.json();
        if (data.error) return alert(data.error);

        currentUserId = data._id;
        document.getElementById("user-message").innerText = `User created: ${data.username}`;
        document.getElementById("balance").innerText = data.balance;
    } catch (err) {
        console.error(err);
    }
}

async function fetchBalance() {
    if (!currentUserId) return;
    try {
        const res = await fetch(`${API_BASE}/users/${currentUserId}`);
        const data = await res.json();
        document.getElementById("balance").innerText = data.balance;
    } catch (err) {
        console.error(err);
    }
}

// ------------------ Bet ------------------
async function placeBet() {
    if (!currentUserId) return alert("Create a user first");
    const amount = Number(document.getElementById("amount").value);
    const type = document.getElementById("bet-type").value;

    if (amount <= 0) return alert("Enter valid amount");

    try {
        const res = await fetch(`${API_BASE}/bets`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: currentUserId, amount, type })
        });
        const data = await res.json();
        if (data.error) return alert(data.error);

        document.getElementById("bet-message").innerText = `Bet placed: ${type} ${amount}`;
        fetchBalance();
        fetchRecentBets();
    } catch (err) {
        console.error(err);
    }
}

// ------------------ Recent Bets ------------------
async function fetchRecentBets() {
    try {
        const res = await fetch(`${API_BASE}/bets/recent`);
        const bets = await res.json();
        const list = document.getElementById("results-list");
        list.innerHTML = "";
        bets.forEach(b => {
            const li = document.createElement("li");
            li.innerText = `${b.usernameRef}: ${b.type} ${b.amount} → ${b.status}`;
            list.appendChild(li);
        });
    } catch (err) {
        console.error(err);
    }
}

// ------------------ Graph ------------------
async function fetchGraph() {
    try {
        const res = await fetch(`${API_BASE}/graph`);
        const data = await res.json();
        renderGraph(data);
    } catch (err) {
        console.error(err);
    }
}

function renderGraph(data) {
    const ctx = document.getElementById("priceGraph").getContext("2d");
    const labels = data.map(p => new Date(p.t).toLocaleTimeString());
    const values = data.map(p => p.v);

    if (chart) {
        chart.data.labels = labels;
        chart.data.datasets[0].data = values;
        chart.update();
    } else {
        chart = new Chart(ctx, {
            type: "line",
            data: {
                labels,
                datasets: [{
                    label: "Price",
                    data: values,
                    borderColor: "#ffcc00",
                    backgroundColor: "rgba(255,204,0,0.2)",
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: { display: true },
                    y: { display: true }
                }
            }
        });
    }
}

// ------------------ Countdown ------------------
async function fetchRoundStatus() {
    try {
        const res = await fetch(`${API_BASE}/round/status`);
        const round = await res.json();
        if (!round) return;

        document.getElementById("countdown").innerText = round.remaining;
    } catch (err) {
        console.error(err);
    }
}

// ------------------ Auto Refresh ------------------
setInterval(fetchGraph, 1000);
setInterval(fetchRoundStatus, 500);
setInterval(fetchRecentBets, 2000);
setInterval(fetchBalance, 5000);
