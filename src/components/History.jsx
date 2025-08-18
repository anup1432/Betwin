import React from "react";

const historyData = [
  { type: "Bet", direction: "up", amount: 500, result: "Win", time: "2025-08-17 11:10" },
  { type: "Deposit", method: "TRC20", amount: 1000, result: "Approved", time: "2025-08-17 10:58" },
  { type: "Bet", direction: "down", amount: 600, result: "Lose", time: "2025-08-17 10:54" },
  { type: "Withdrawal", method: "ERC20", amount: 800, result: "Pending", time: "2025-08-17 10:34" },
];

function History() {
  return (
    <div className="history" style={{ background: "#21262e", color: "#fff", borderRadius: "8px", padding: "14px", margin: "14px 0", maxWidth: "370px" }}>
      <h2>User History</h2>
      <table style={{ width: "100%", fontSize: "15px" }}>
        <thead>
          <tr>
            <th>Type</th>
            <th>Details</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {historyData.map((item, i) => (
            <tr key={i}>
              <td>{item.type}</td>
              <td>{item.type === "Bet" ? (<span style={{ color: item.direction === "up" ? "green" : "red", fontWeight: 500 }}>{item.direction.toUpperCase()}</span>) : item.method}</td>
              <td>₹{item.amount}</td>
              <td>
                <span style={{ color: item.result === "Win" ? "green" : item.result === "Lose" ? "red" : item.result === "Pending" ? "#f2b100" : "#2aabdb", fontWeight: 500 }}>
                  {item.result}
                </span>
              </td>
              <td>{item.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default History;
