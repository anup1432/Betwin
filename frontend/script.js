const API_BASE = "https://betwin-winn.onrender.com"; // Your backend URL
let currentUserId = null;

// Create User
function createUser() {
    const username = document.getElementById("username").value;
    if (!username) return alert("Enter username");

    fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username })
    })
    .then(res => res.json())
    .then(data => {
        currentUserId = data._id;
        document.getElementById("user-message").innerText = `User created! ID: ${currentUserId}`;
    })
    .catch(err => console.error("❌ Create User Error:", err));
}

// Place Bet
function placeBet() {
    if (!currentUserId) return alert("Create a user first");

    const amount = document.getElementById("amount").value;
    const type = document.getElementById("bet-type").value;

    fetch(`${API_BASE}/bets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, amount, type })
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById("bet-message").innerText = `Bet placed! Result: ${data.result || "Pending"}`;
        getResults(); // Refresh results automatically
    })
    .catch(err => console.error("❌ Place Bet Error:", err));
}

// Get Results
function getResults() {
    fetch(`${API_BASE}/bets`)
    .then(res => res.json())
    .then(data => {
        const list = document.getElementById("results-list");
        list.innerHTML = "";
        data.forEach(bet => {
            const li = document.createElement("li");

            // Agar populate hua hai to username nikaalo, warna ID dikhao
            const username = bet.userId?.username || bet.userId;

            li.innerText = `User: ${username}, Amount: ${bet.amount}, Type: ${bet.type}, Result: ${bet.result || "Pending"}`;
            list.appendChild(li);
        });
    })
    .catch(err => console.error("❌ Get Results Error:", err));
}
