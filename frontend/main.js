const API_BASE = "https://twin-winn.onrender.com"; // Apna Render backend URL

// Registration
function registerUser(username, password) {
  fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(data => {
      alert("Registration: " + (data.message || data.error));
    })
    .catch(err => alert("Error: " + err.message));
}

// Login
function loginUser(username, password) {
  fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.token) {
        alert("Login Success! Wallet: $" + data.wallet);
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        updateWallet();
      } else {
        alert("Login Failed: " + (data.error || "Unknown error"));
      }
    })
    .catch(err => alert("Error: " + err.message));
}

// Bet
function placeBet(amount, side) {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    alert("Login first!");
    return;
  }
  fetch(`${API_BASE}/api/bet`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ userId, amount, side })
  })
    .then(res => res.json())
    .then(data => {
      if (data.win !== undefined) {
        alert(`Bet ${side.toUpperCase()} - Result: ${data.win ? "Win 🎉" : "Lose 😢"}\nNew Balance: $${data.wallet}`);
        updateWallet();
      } else {
        alert("Bet failed: " + (data.error || JSON.stringify(data)));
      }
    })
    .catch(err => alert("Error: " + err.message));
}

// Wallet Info
function updateWallet() {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    document.getElementById("walletInfo").innerText = "Please log in!";
    return;
  }
  fetch(`${API_BASE}/api/wallet/${userId}`)
    .then(res => res.json())
    .then(data => {
      document.getElementById("walletInfo").innerText = "Wallet Balance: $" + data.balance;
    })
    .catch(err => {
      document.getElementById("walletInfo").innerText = "Error fetching wallet.";
    });
}

// Button Handlers
document.getElementById("registerBtn").onclick = function() {
  const username = document.getElementById("regUser").value;
  const password = document.getElementById("regPass").value;
  registerUser(username, password);
};
document.getElementById("loginBtn").onclick = function() {
  const username = document.getElementById("loginUser").value;
  const password = document.getElementById("loginPass").value;
  loginUser(username, password);
};
document.getElementById("betUpBtn").onclick = function() {
  const amount = +document.getElementById("betAmount").value;
  placeBet(amount, "up");
};
document.getElementById("betDownBtn").onclick = function() {
  const amount = +document.getElementById("betAmount").value;
  placeBet(amount, "down");
};

// On page load, show wallet if already logged in
window.onload = updateWallet;


