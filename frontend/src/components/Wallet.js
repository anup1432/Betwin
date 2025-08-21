import React, { useState } from "react";
import { depositRequest, withdrawRequest } from "../services/api.js";

const Wallet = ({ token }) => {
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");

  const handleDeposit = async () => {
    const res = await depositRequest(token, { amount: Number(amount), txHash: "TX123" });
    alert("Deposit Requested: " + res.data.id);
  };

  const handleWithdraw = async () => {
    const res = await withdrawRequest(token, { amount: Number(amount), address });
    alert("Withdraw Requested: " + res.data.id);
  };

  return (
    <div>
      <h2>Wallet</h2>
      <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" />
      <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Wallet Address" />
      <button onClick={handleDeposit}>Deposit</button>
      <button onClick={handleWithdraw}>Withdraw</button>
    </div>
  );
};

export default Wallet;
