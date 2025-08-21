import React, { useEffect, useState } from "react";
import { getDeposits, approveDeposit, rejectDeposit } from "../services/api.js";

const AdminPanel = ({ token }) => {
  const [deposits, setDeposits] = useState([]);

  const fetchDeposits = async () => {
    const res = await getDeposits(token);
    setDeposits(res.data);
  };

  useEffect(() => {
    fetchDeposits();
    const interval = setInterval(fetchDeposits, 5000); // auto refresh
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (id) => {
    await approveDeposit(token, id);
    fetchDeposits();
  };

  const handleReject = async (id) => {
    await rejectDeposit(token, id);
    fetchDeposits();
  };

  return (
    <div>
      <h2>Admin Panel - Deposits</h2>
      <ul>
        {deposits.map((d) => (
          <li key={d._id}>
            {d.amount} - {d.status}
            <button onClick={() => handleApprove(d._id)}>Approve</button>
            <button onClick={() => handleReject(d._id)}>Reject</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPanel;
