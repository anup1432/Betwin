import { Battle } from './models/Battle.js';
import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10);

const bots = ['BotNeo','CryptoKing','Whale42','ScalpX','LunaWolf','GridPro','BitGuru','Satoshi Jr','Dogefan','AlphaBot'];

export async function createBattle({ symbol='BTCUSDT', duration=60 }) {
  const startAt = Date.now();
  const endAt = startAt + duration * 1000;
  const startPrice = 60000 + Math.floor(Math.random()*2000) - 1000;
  const battle = await Battle.create({ symbol, startAt, endAt, startPrice, points: [{ t: startAt, p: startPrice }], picks: [] });
  scheduleBots(battle._id);
  return battle;
}

export async function joinBattle(battleId, { user, side }) {
  const b = await Battle.findById(battleId);
  if (!b) throw new Error('Battle not found');
  if (b.finished) throw new Error('Battle finished');
  if (!['UP','DOWN'].includes(side)) throw new Error('Side invalid');
  if (b.picks.some(p=>p.user===user)) throw new Error('Already joined');
  b.picks.push({ user, side });
  await b.save();
  return b;
}

function stepPrice(last) {
  const step = (Math.random() - 0.5) * 50; // ~±25
  const next = Math.max(50, last + step);
  return Math.round(next * 100) / 100;
}

export async function tickAll() {
  const now = Date.now();
  const open = await Battle.find({ finished: false });
  for (const b of open) {
    const last = b.points[b.points.length-1];
    if (!last || now - last.t >= 1000) {
      b.points.push({ t: now, p: stepPrice(last?.p || b.startPrice) });
    }
    if (now >= b.endAt) {
      const endPrice = b.points[b.points.length-1].p;
      const change = endPrice - b.startPrice;
      const direction = change >= 0 ? 'UP' : 'DOWN';
      const winners = b.picks.filter(x=>x.side===direction).map(x=>x.user);
      b.finished = true;
      b.result = { endPrice, change, direction, winners };
    }
    await b.save();
  }
}

setInterval(() => { tickAll().catch(()=>{}); }, 800);

export async function addBot(battleId, side) {
  const name = bots[Math.floor(Math.random()*bots.length)] + '-' + nanoid().slice(0,3);
  return joinBattle(battleId, { user: name, side });
}

async function scheduleBots(battleId) {
  function loop() {
    const delay = 3000 + Math.random()*9000; // 3–12s
    setTimeout(async () => {
      try {
        const b = await Battle.findById(battleId);
        if (!b || b.finished) return;
        const side = Math.random() < 0.5 ? 'UP' : 'DOWN';
        await addBot(battleId, side);
        loop();
      } catch {}
    }, delay);
  }
  loop();
}
