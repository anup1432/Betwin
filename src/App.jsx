import React from "react";
import GameChart from "./components/GameChart";
import BetForm from "./components/BetForm";
import BotAvatars from "./components/BotAvatars";
import Leaderboard from "./components/Leaderboard";
import DepositWithdrawal from "./components/DepositWithdrawal";
import History from "./components/History";
import Position from "./components/Position";
import AdminPanel from "./components/AdminPanel";

function App() {
  return (
    <div>
      <DepositWithdrawal />
      <GameChart />
      <BotAvatars />
      <BetForm />
      <Position />
      <Leaderboard />
      <History />
      <AdminPanel />
    </div>
  );
}

export default App;
