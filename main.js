const { useState, useEffect } = React;

function BetwinApp() {
  const [balance, setBalance] = useState(1000); // Starting balance
  const [theme, setTheme] = useState("dark");
  const [graphValue, setGraphValue] = useState(100); // Simulated graph value
  const [graphUp, setGraphUp] = useState(true); // Graph direction up/down
  const [betAmount, setBetAmount] = useState(10);
  const [betSide, setBetSide] = useState(null);
  const [message, setMessage] = useState("");

  // Simulate graph changes every 5s with random up/down and value changes
  useEffect(() => {
    const interval = setInterval(() => {
      const up = Math.random() > 0.5;
      const change = Math.floor(Math.random() * 10) + 1;
      setGraphUp(up);
      setGraphValue((val) => up ? val + change : val - change);
      
      // Check bet result if bet placed
      if (betSide !== null) {
        if ((betSide === "up" && up) || (betSide === "down" && !up)) {
          const winAmount = betAmount * 2 * 0.98; // 2% fee
          setBalance((bal) => bal + winAmount);
          setMessage(`You won ${winAmount.toFixed(2)} USDT!`);
        } else {
          setMessage(`You lost ${betAmount} USDT!`);
        }
        setBetSide(null);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [betSide, betAmount]);

  // Place bet handler
  const placeBet = (side) => {
    if (betSide !== null) {
      setMessage("Wait for current round to finish!");
      return;
    }
    if (betAmount <= 0 || betAmount > balance) {
      setMessage("Invalid bet amount!");
      return;
    }
    setBalance((bal) => bal - betAmount);
    setBetSide(side);
    setMessage(`Bet placed on ${side.toUpperCase()}`);
  };

  // Toggle theme
  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.remove("light");
    } else {
      document.body.classList.add("light");
    }
  }, [theme]);

  return (
    <div className="container">
      <header className="header">
        <div className="balance-section">
          Balance: {balance.toFixed(2)} USDT
          <button className="deposit-btn" onClick={() => alert("Deposit feature coming soon!")}>+ Deposit</button>
        </div>
        <button className="menu-btn" onClick={() => alert("Menu coming soon!")}>☰</button>
      </header>

      <main className="game-area">
        <div className={`graph ${graphUp ? "graph-point-up" : "graph-point-down"}`}>
          <div className="graph-number">{graphValue}</div>
          <p>Graph shows {graphUp ? "UP" : "DOWN"}</p>
        </div>

        <div>
          <input
            type="number"
            value={betAmount}
            min="1"
            max={balance}
            onChange={(e) => setBetAmount(Number(e.target.value))}
            placeholder="Bet amount"
          />
          <button className="bet-btn" onClick={() => placeBet("up")}>Bet Up</button>
          <button className="bet-btn red" onClick={() => placeBet("down")}>Bet Down</button>
        </div>

        <p>{message}</p>

        <button className="theme-toggle" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          Switch to {theme === "dark" ? "Light" : "Dark"} Theme
        </button>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<BetwinApp />);
