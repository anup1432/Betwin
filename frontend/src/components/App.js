import React from "react";
import Graph from "./components/Graph.js";
import Wallet from "./components/Wallet.js";
import AdminPanel from "./components/AdminPanel.js";

const token = "YOUR_USER_OR_ADMIN_JWT"; // replace with real JWT token

function App() {
  return (
    <div>
      <h1>BetWin Prediction Game</h1>
      <Graph />
      <Wallet token={token} />
      <AdminPanel token={token} />
    </div>
  );
}

export default App;
