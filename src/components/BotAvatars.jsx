import React from "react";

const botAvatars = [
  "https://api.dicebear.com/6.x/bottts/svg?seed=bot1",
  "https://api.dicebear.com/6.x/bottts/svg?seed=bot2",
  "https://api.dicebear.com/6.x/bottts/svg?seed=bot3",
  "https://api.dicebear.com/6.x/bottts/svg?seed=bot4",
  "https://api.dicebear.com/6.x/bottts/svg?seed=bot5",
  "https://api.dicebear.com/6.x/bottts/svg?seed=bot6",
  "https://api.dicebear.com/6.x/bottts/svg?seed=bot7",
  "https://api.dicebear.com/6.x/bottts/svg?seed=bot8",
];

function getRandomBet(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const getBotSides = () => {
  let indices = Array.from({ length: 8 }, (_, i) => i);
  const upIndices = [];
  while (upIndices.length < 4) {
    const idx = Math.floor(Math.random() * indices.length);
    upIndices.push(indices[idx]);
    indices.splice(idx, 1);
  }
  return {
    up: upIndices.map((i) => ({
      avatar: botAvatars[i],
      amount: getRandomBet(50, 500),
    })),
    down: indices.map((i) => ({
      avatar: botAvatars[i],
      amount: getRandomBet(50, 500),
    })),
  };
};

function BotAvatars() {
  const { up, down } = getBotSides();

  return (
    <div
      className="bot-avatars"
      style={{ display: "flex", justifyContent: "space-between", margin: "22px 0" }}
    >
      <div
        className="bot-side"
        style={{ width: "48%", border: "1px solid #2ACB47", borderRadius: "8px", padding: "10px" }}
      >
        <span style={{ fontWeight: "bold", color: "green" }}>UP SIDE BOTS</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "8px" }}>
          {up.map((bot, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <img
                src={bot.avatar}
                alt="Bot Avatar"
                width={55}
                height={55}
                style={{ borderRadius: "10px" }}
              />
              <div style={{ color: "#2ACB47", fontWeight: "bold" }}>₹{bot.amount}</div>
            </div>
          ))}
        </div>
      </div>
      <div
        className="bot-side"
        style={{ width: "48%", border: "1px solid #CB2A2A", borderRadius: "8px", padding: "10px" }}
      >
        <span style={{ fontWeight: "bold", color: "red" }}>DOWN SIDE BOTS</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "8px" }}>
          {down.map((bot, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <img
                src={bot.avatar}
                alt="Bot Avatar"
                width={55}
                height={55}
                style={{ borderRadius: "10px" }}
              />
              <div style={{ color: "#CB2A2A", fontWeight: "bold" }}>₹{bot.amount}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BotAvatars;
