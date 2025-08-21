const API_BASE = "https://betwin-winn.onrender.com"; // ✅ Backend URL
let currentUserId = null;

// 🟢 Create User
function createUser() {
    const username = document.getElementById("username").value.trim();
    if (!username) {
        alert("Please enter a username");
        return;
    }

    fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username })
    })
    .then(res => res.json())
    .then(data => {
        if (data._id) {
            currentUserId = data._id;
            document.getElementById("user-message").innerText = `✅ User created! ID: ${currentUserId}`;
        } else {
            document.getElementById("user-message").innerText = `⚠️ Error creating user`;
        }
    })
    .catch(err => {
        console.error("Create User Error:", err);
        alert("Failed to create user. Please try again.");
    });
}

// 🟢 Place Bet
function placeBet() {
    if (!currentUserId) {
        alert("Please create a user first");
        return;
    }

    const amount = document.getElementById("amount").value.trim();
    const type = document.getElementById("bet-type").value;

    if (!amount || isNaN(amount)) {
        alert("Enter a valid amount");
        return;
    }

    fetch(`${API_BASE}/bets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, amount, type })
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById("bet-message").innerText =
            `🎲 Bet placed! Result: ${data.result || "Pending"}`;
        getResults(); // Refresh results automatically
    })
    .catch(err => {
        console.error("Place Bet Error:", err);
        alert("Failed to place bet. Please try again.");
    });
}

// 🟢 Get Results
function getResults() {
    fetch(`${API_BASE}/bets`)
    .then(res => res.json())
    .then(data => {
        const list = document.getElementById("results-list");
        list.innerHTML = "";
        data.forEach(bet => {
            const li = document.createElement("li");
            li.innerText = `👤 User: ${bet.userId}, 💰 Amount: ${bet.amount}, 🎯 Type: ${bet.type}, 🏆 Result: ${bet.result || "Pending"}`;
            list.appendChild(li);
        });
    })
    .catch(err => {
        console.error("Get Results Error:", err);
        alert("Failed to fetch results.");
    });
}
