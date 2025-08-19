const API_BASE = "https://twin-winn.onrender.com"; // Apna backend URL

// User Registration
function registerUser(username, password) {
  fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({username, password})
  })
    .then(res => res.json())
    .then(data => {
      alert("Registration: " + JSON.stringify(data));
    })
    .catch(err => alert("Error: " + err.message));
}

// User Login
function loginUser(username, password) {
  fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({username, password})
  })
    .then(res => res.json())
    .then(data => {
      if (data.token) {
        alert("Login success! Wallet: " + data.wallet);
        // Store token for future requests
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
      } else {
        alert("Login failed: " + data.error);
      }
    })
    .catch(err => alert("Error: " + err.message));
}

// Place a Bet
function placeBet(amount, side) {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    alert("Please log in first.");
    return;
  }
  fetch(`${API_BASE}/api/bet`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({userId, amount, side})
  })
    .then(res => res.json())
    .then(data => {
      if (data.win !== undefined) {
        alert(`Bet Placed! Result: ${data.win ? "Win" : "Lose"} | New Wallet: $${data.wallet}`);
      } else {
        alert("Bet failed: " + (data.error || JSON.stringify(data)));
      }
    })
    .catch(err => alert("Error: " + err.message));
}

// Example: Buttons can call these functions
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
  placeBet(10, "up");
};
document.getElementById("betDownBtn").onclick = function() {
  placeBet(10, "down");
};

