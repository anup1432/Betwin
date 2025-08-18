import React, { useState } from "react";

function DepositWithdrawal() {
  const [balance, setBalance] = useState(2000);
  const [menuOpen, setMenuOpen] = useState(false);
  const [depositModal, setDepositModal] = useState(false);
  const [withdrawModal, setWithdrawModal] = useState(false);

  const handleDeposit = () => {
    setBalance(balance + 1000);
    setDepositModal(false);
  };

  const handleWithdraw = () => {
    if (balance < 1000) return alert("Insufficient balance");
    setBalance(balance - 1000);
    setWithdrawModal(false);
  };

  return (
    <div style={{ display: "flex", gap: "18px", alignItems: "center" }}>
      <div
        style={{
          background: "#252a35",
          padding: "7px 18px",
          borderRadius: "22px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <span>Balance: ₹{balance}</span>
        <button
          style={{
            background: "#23db4b",
            color: "#fff",
            marginLeft: 10,
            border: "none",
            borderRadius: "50%",
            width: "29px",
            height: "29px",
            fontSize: "20px",
            cursor: "pointer",
          }}
          onClick={() => setDepositModal(true)}
          title="Deposit"
        >
          +
        </button>
      </div>
      <div style={{ position: "relative" }}>
        <button
          style={{
            background: "#252a35",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "24px",
            padding: "6px 14px",
            cursor: "pointer",
          }}
          onClick={() => setMenuOpen(!menuOpen)}
          title="Menu"
        >
          &#8942;
        </button>
        {menuOpen && (
          <div
            style={{
              position: "absolute",
              top: "38px",
              right: 0,
              background: "#222",
              color: "#fff",
              boxShadow: "0 0 16px #0002",
              borderRadius: "8px",
              zIndex: 99,
              width: "220px",
              padding: "10px",
            }}
          >
            <button
              style={{ width: "100%", marginBottom: "7px", padding: "7px" }}
              onClick={() => {
                setWithdrawModal(true);
                setMenuOpen(false);
              }}
            >
              Withdraw
            </button>
            <button
              style={{ width: "100%", marginBottom: "7px", padding: "7px" }}
              onClick={() => alert("History will show here")}
            >
              History
            </button>
            <button style={{ width: "100%", padding: "7px" }}>
              <a
                href="https://t.me/capten_0_0_0"
                target="_blank"
                style={{ color: "#29abe2", textDecoration: "none" }}
                rel="noopener noreferrer"
              >
                Contact on Telegram
              </a>
            </button>
            <div style={{ marginTop: "7px", fontSize: "12px" }}>
              <strong>Wallets for deposit:</strong>
              <br />
              TRC20: <span style={{ color: "#23db4b" }}>TWZHqkbbYTnehQ2TxnH4NgNt4crGLNy8Ns</span>
              <br />
              ERC20: <span style={{ color: "#23db4b" }}>0xE1D4b2BEC237AEDDB47da56b82b2f15812e45B44</span>
              <br />
              Polygon: <span style={{ color: "#23db4b" }}>0xE1D4b2BEC237AEDDB47da56b82b2f15812e45B44</span>
              <br />
              TON: <span style={{ color: "#23db4b" }}>EQAj7vKLbaWjaNbAuAKP1e1HwmdYZ2vJ2xtWU8qq3JafkfxF</span>
            </div>
          </div>
        )}
      </div>

      {depositModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "#0006",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: "#fff",
              color: "#222",
              borderRadius: "12px",
              padding: "26px",
              minWidth: "340px",
              textAlign: "center",
            }}
          >
            <h3>Deposit Funds</h3>
            <p>
              Send USDT or TON to your wallet and notify admin on Telegram
              <br />
              <strong>TRC20:</strong> TWZHqkbbYTnehQ2TxnH4NgNt4crGLNy8Ns
              <br />
              <strong>ERC20:</strong> 0xE1D4b2BEC237AEDDB47da56b82b2f15812e45B44
              <br />
              <strong>Polygon:</strong> 0xE1D4b2BEC237AEDDB47da56b82b2f15812e45B44
              <br />
              <strong>TON:</strong> EQAj7vKLbaWjaNbAuAKP1e1HwmdYZ2vJ2xtWU8qq3JafkfxF
            </p>
            <button
              onClick={handleDeposit}
              style={{
                background: "#23db4b",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "8px 20px",
                marginTop: "18px",
              }}
            >
              Mock Deposit ₹1000
            </button>
            <button
              onClick={() => setDepositModal(false)}
              style={{ marginLeft: "18px" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {withdrawModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "#0006",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: "#fff",
              color: "#222",
              borderRadius: "12px",
              padding: "26px",
              minWidth: "320px",
              textAlign: "center",
            }}
          >
            <h3>Withdraw Funds</h3>
            <p>Withdrawals are processed by admin after approval.</p>
            <button
              onClick={handleWithdraw}
              style={{
                background: "#e32c2c",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "8px 20px",
                marginTop: "18px",
              }}
            >
              Mock Withdraw ₹1000
            </button>
            <button
              onClick={() => setWithdrawModal(false)}
              style={{ marginLeft: "18px" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DepositWithdrawal;
