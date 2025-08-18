import React from "react";

const leaderboardData = [
  { username: "Shivam", profit: 2450 },
  { username: "Ali", profit: 1200 },
  { username: "Kapil", profit: 800 },
  { username: "Sara", profit: 600 },
  { username: "Ahmed", profit: 500 },
];

function Leaderboard() {
  return (
    <div
      className="leaderboard"
      style={{
        background: "#252a35",
        color: "#fff",
        borderRadius: "8px",
        padding: "14px",
        margin: "14px 0",
        maxWidth: "340px",
      }}
    >
      <h2 style={{ marginBottom: "8px" }}>Leaderboard</h2>
      <table style={{ width: "100%" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>User</th>
            <th style={{ textAlign: "right" }}>Profit</th>
          </tr>
        </thead>
        <tbody>
          {leaderboardData.map((user, i) => (
            <tr key={i}>
              <td>{user.username}</td>
              <td style={{ textAlign: "right" }}>₹{user.profit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Leaderboard;
