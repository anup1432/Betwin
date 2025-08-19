function getOrCreateUserId() {
  let userId = localStorage.getItem("userId");
  if (!userId) {
    userId = "u_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-6);
    localStorage.setItem("userId", userId);
  }
  return userId;
}

// Show userId on page
document.getElementById('userid-show').innerText = "Your User ID: " + getOrCreateUserId();

// Bet actions example (Replace API_BASE with your actual backend URL)
const API_BASE = "https://your-backend-url.com"; // optional, add as needed

document.getElementById('betUpBtn').onclick = function() {
  let amount = document.getElementById("betAmount").value;
  let userId = getOrCreateUserId();
  // API call example (backend required)
  /*
  fetch(API_BASE + '/api/bet/up', {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({ userId, amount })
  })
  .then(resp => resp.json())
  .then(data => {
    document.getElementById('walletInfo').innerText = data.wallet || "Bet placed!";
  });
  */
  document.getElementById('walletInfo').innerText = `UP bet placed for $${amount} (UserID: ${userId})`;
}
document.getElementById('betDownBtn').onclick = function() {
  let amount = document.getElementById("betAmount").value;
  let userId = getOrCreateUserId();
  // API call example (backend required)
  /*
  fetch(API_BASE + '/api/bet/down', {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({ userId, amount })
  })
  .then(resp => resp.json())
  .then(data => {
    document.getElementById('walletInfo').innerText = data.wallet || "Bet placed!";
  });
  */
  document.getElementById('walletInfo').innerText = `DOWN bet placed for $${amount} (UserID: ${userId})`;
}

// You can show wallet info, history, analytics using this userId in your backend as needed
