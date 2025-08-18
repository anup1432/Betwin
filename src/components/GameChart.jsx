import React from "react";
import TradingViewWidget from "react-tradingview-widget";

function GameChart() {
  return (
    <div className="game-chart" style={{ height: "400px", width: "100%" }}>
      <TradingViewWidget symbol="NASDAQ:AAPL" theme="dark" locale="en" autosize />
    </div>
  );
}

export default GameChart;
