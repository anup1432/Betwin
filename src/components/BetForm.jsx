import React, { useState } from "react";

function BetForm() {
  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState("up");
  const [betPlaced, setBetPlaced] = useState(false);

  const handleBet = () => {
    if (!amount || isNaN(amount) || amount <= 0) {
      alert("Please enter a valid bet amount.");
      return;
    }
    setBetPlaced(true);
    setTimeout(() => setBetPlaced(false), 20000); // 20s hold time
  };

  return (
    <div
      className="bet-form"
      style={{
        margin: "24px 0",
        background: "#222",
        borderRadius: "8px",
        padding: "16px",
        maxWidth: "420px",
      }}
    >
      <h2>Place Your Bet</h2>
      <div style={{ display: "flex", gap: "12px", marginBottom: "8px" }}>
        <button
          style={{
            background: direction === "up" ? "green" : "#555",
            color: "#fff",
            padding: "6px 18px",
            borderRadius: "4px",
            border: "none",
            cursor: "pointer",
          }}
          onClick={() => setDirection("up")}
          disabled={betPlaced}
        >
          Up
        </button>
        <button
          style={{
            background: direction === "down" ? "red" : "#555",
            color: "#fff",
            padding: "6px 18px",
            borderRadius: "4px",
            border: "none",
            cursor: "pointer",
          }}
          onClick={() => setDirection("down")}
          disabled={betPlaced}
        >
          Down
        </button>
      </div>
      <input
        type="number"
        min="1"
        placeholder="Bet Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        disabled={betPlaced}
        style={{ width: "140px", marginBottom: "12px", padding: "8px", borderRadius: "4px" }}
      />
      <br />
      <button
        onClick={handleBet}
        disabled={betPlaced}
        style={{
          background: "#0099FF",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          padding: "8px 24px",
          marginTop: "12px",
          cursor: betPlaced ? "not-allowed" : "pointer",
        }}
      >
        {betPlaced ? "Hold Time (20s)" : "Place Bet"}
      </button>
      {betPlaced && (
        <p style={{ color: "orange", marginTop: "10px" }}>Bet placed! Wait for the next round…</p>
      )}
    </div>
  );
}

export default BetForm;
