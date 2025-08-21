const API_BASE = "https://betwin-winn.onrender.com"; // Backend URL
let currentUser = null;

// Create User
function createUser() {
    const username = document.getElementById("username").value;
    if (!username) return alert("Enter username");

    currentUser = {
        id: Math.floor(Math.random() * 10000),
        username,
        balance: 100,
        avatar: `https://api.dicebear.com/6.x/pixel-art/svg?seed=${username}`
    };

    document.getElementById("user-message").innerText = `Welcome ${currentUser.username}`;
    document.getElementById("balance").innerText = currentUser.balance;
    document.getElementById("avatar").innerHTML = `<img src="${currentUser.avatar}" width="80">`;
}

// Place Bet
function placeBet() {
    if (!currentUser) return alert("Create a user first");

    const amount = parseInt(document.getElementById("amount").value);
    const type = document.getElementById("bet-type").value;
    if (!amount || amount <= 0) return alert("Enter valid amount");

    if (amount > currentUser.balance) return alert("Insufficient balance");

    currentUser.balance -= amount;
    document.getElementById("balance").innerText = currentUser.balance;

    // Fake result
    const result = Math.random() > 0.5 ? "Win" : "Lose";
    if (result === "Win") currentUser.balance += amount * 2;

    document.getElementById("balance").innerText = currentUser.balance;
    document.getElementById("bet-message").innerText = `You ${result} the bet!`;

    addResult(currentUser.username, amount, type, result);
}

// Add result to list
function addResult(user, amount, type, result) {
    const list = document.getElementById("results-list");
    const li = document.createElement("li");
    li.innerText = `User: ${user}, Amount: ${amount}, Type: ${type}, Result: ${result}`;
    list.prepend(li);
}

// Deposit
function deposit() {
    if (!currentUser) return alert("Create a user first");
    currentUser.balance += 50;
    document.getElementById("balance").innerText = currentUser.balance;
}

// Withdraw
function withdraw() {
    if (!currentUser) return alert("Create a user first");
    if (currentUser.balance < 50) return alert("Not enough balance");
    currentUser.balance -= 50;
    document.getElementById("balance").innerText = currentUser.balance;
}

// Bots Playing
setInterval(() => {
    const bots = ["Bot_A", "Bot_B", "Bot_C"];
    const list = document.getElementById("bots-list");
    list.innerHTML = "";
    bots.forEach(bot => {
        const amount = Math.floor(Math.random() * 100);
        const type = Math.random() > 0.5 ? "UP" : "DOWN";
        const result = Math.random() > 0.5 ? "Win" : "Lose";

        const li = document.createElement("li");
        li.innerText = `${bot} bet ${amount} on ${type} → ${result}`;
        list.appendChild(li);
    });
}, 3000);
