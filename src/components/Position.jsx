import React from "react";

const positionsData = [
  { direction: "up", amount: 700, time: "2025-08-17 11:35", status: "Pending" },
  { direction: "down", amount: 350, time: "2025-08-17 11:32", status: "Won" },
  { direction: "up", amount: 500, time: "2025-08-17 11:25", status: "Lost" },
];

function Position() {
  return (
    <div className="positions" style={{ background: "#223148", color: "#fff", borderRadius: "8px", padding: "14px", margin: "14px 0", maxWidth: "340px" }}>
      <h2>My Bets & Positions</h2>
      <table style={{ width: "100%", fontSize: "15px" }}>
        <thead>
          <tr>
            <th>Direction</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {positionsData.map((pos, i) => (
            <tr key={i}>
              <td><span style={{ color: pos.direction === "up" ? "green" : "red", fontWeight: 500 }}>{pos.direction.toUpperCase()}</span></td>
              <td>₹{pos.amount}</td>
              <td><span style={{ color: pos.status === "Pending" ? "#f2b100" : pos.status === "Won" ? "green" : "red", fontWeight: 500 }}>{pos.status}</span></td>
              <td>{pos.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Position;
