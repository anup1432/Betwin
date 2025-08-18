import React, { useState } from "react";

const depositRequests = [
  { id: 1, user: "Shivam", amount: 1500, wallet: "TRC20", status: "Pending" },
  { id: 2, user: "Ali", amount: 700, wallet: "TON", status: "Pending" },
];

const withdrawalRequests = [
  { id: 1, user: "Kapil", amount: 1100, wallet: "ERC20", status: "Pending" },
];

const users = [
  { username: "Shivam", status: "active" },
  { username: "Ali", status: "active" },
  { username: "Sara", status: "suspended" },
];

function AdminPanel() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "anup1432" && password === "@nup1432") setLoggedIn(true);
    else alert("Wrong credentials");
  };

  const handleApprove = (type, id) => {
    alert(`Approved ${type} request ID ${id}`);
  };

  const handleSuspend = (name) => {
    alert(`${name} suspended`);
  };

  const handleUnban = (name) => {
    alert(`${name} unbanned`);
  };

  if (!loggedIn) {
    return (
      <div
        style={{
          background: "#223148",
          color: "#fff",
          borderRadius: "8px",
          padding: "22px",
          maxWidth: "340px",
          margin: "16px auto",
        }}
      >
        <h2>Admin Panel Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: "100%", margin: "7px 0", padding: "7px" }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", margin: "7px 0", padding: "7px" }}
          />
          <button
            type="submit"
            style={{
              background: "#25c948",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "8px 20px",
              marginTop: "10px",
              width: "100%",
            }}
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#252a35",
        color: "#fff",
        borderRadius: "8px",
        padding: "14px",
        maxWidth: "480px",
        margin: "16px auto",
      }}
    >
      <h2>Admin Dashboard</h2>
      <div style={{ marginBottom: "18px" }}>
        <h4>Pending Deposit Requests</h4>
        <ul>
          {depositRequests.map((req) => (
            <li
              key={req.id}
              style={{ marginBottom: "6px", borderBottom: "1px solid #555", paddingBottom: "6px" }}
            >
              {req.user} — ₹{req.amount} [{req.wallet}]
              <button
                style={{
                  marginLeft: "9px",
                  background: "#25c948",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  padding: "4px 11px",
                }}
                onClick={() => handleApprove("deposit", req.id)}
              >
                Approve
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div style={{ marginBottom: "18px" }}>
        <h4>Pending Withdrawal Requests</h4>
        <ul>
          {withdrawalRequests.map((req) => (
            <li
              key={req.id}
              style={{ marginBottom: "6px", borderBottom: "1px solid #555", paddingBottom: "6px" }}
            >
              {req.user} — ₹{req.amount} [{req.wallet}]
              <button
                style={{
                  marginLeft: "9px",
                  background: "#25c948",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  padding: "4px 11px",
                }}
                onClick={() => handleApprove("withdrawal", req.id)}
              >
                Approve
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4>User Accounts</h4>
        <ul>
          {users.map((user) => (
            <li
              key={user.username}
              style={{ marginBottom: "6px", borderBottom: "1px solid #555", paddingBottom: "6px" }}
            >
              {user.username} —{" "}
              <span style={{ color: user.status === "active" ? "green" : "red", fontWeight: 500 }}>
                {user.status}
              </span>
              {user.status === "active" && (
                <button
                  style={{
                    marginLeft: "9px",
                    background: "#ce2525",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    padding: "4px 11px",
                  }}
                  onClick={() => handleSuspend(user.username)}
                >
                  Suspend
                </button>
              )}
              {user.status === "suspended" && (
                <button
                  style={{
                    marginLeft: "9px",
                    background: "#23db4b",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    padding: "4px 11px",
                  }}
                  onClick={() => handleUnban(user.username)}
                >
                  Unban
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AdminPanel;
                  
