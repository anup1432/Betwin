/* ========= Market Battle Frontend ========= */

// Keys for persistence
const K = {
  BAL: 'mb_balance_v1',
  EPOCH: 'mb_epoch_v1',
  ROUND: 'mb_round_v1',
  START_PRICE: 'mb_start_price_v1',
  PRICE_SER: 'mb_price_series_v1',
  UP_TOTAL: 'mb_up_total_v1',
  DOWN_TOTAL: 'mb_down_total_v1',
  MY_BETS: 'mb_my_bets_v1' // [{round, side, amount}]
};

// Constants
const BET_WINDOW = 20;     // seconds
const RESULT_WINDOW = 5;   // seconds
const CYCLE = BET_WINDOW + RESULT_WINDOW;

// DOM
const $ = id => document.getElementById(id);
const balEl = $('balance'), roundEl = $('roundNum'), phaseEl = $('phase'),
      timerEl = $('timer'), playersEl = $('players'),
      upEl = $('upTotal'), downEl = $('downTotal'),
      priceVal = $('priceVal'), priceArrow = $('priceArrow'),
      activity = $('activity');

// Helpers
const now = () => Date.now();
const fmt = n => Number(n).toFixed(2);

// Balance (welcome $1 once)
function getBalance() {
  let b = parseFloat(localStorage.getItem(K.BAL));
  if (Number.isNaN(b)) b = 1;
  localStorage.setItem(K.BAL, String(b));
  return b;
}
function setBalance(v){ localStorage.setItem(K.BAL, String(v)); balEl.textContent = fmt(v); }
let balance = getBalance(); balEl.textContent = fmt(balance);

// Epoch & Round
function getEpoch(){
  let e = parseInt(localStorage.getItem(K.EPOCH)||'0',10);
  if(!e){ e = now(); localStorage.setItem(K.EPOCH, String(e)); }
  return e;
}
function setEpoch(t){ localStorage.setItem(K.EPOCH, String(t)); }
function getRound(){
  let r = parseInt(localStorage.getItem(K.ROUND)||'1',10);
  if(!r){ r=1; localStorage.setItem(K.ROUND,'1'); }
  return r;
}
function setRound(n){ localStorage.setItem(K.ROUND, String(n)); roundEl.textContent = n; }

// Price series (for chart)
function getSeries(){
  try{
    const s = JSON.parse(localStorage.getItem(K.PRICE_SER)||'[]');
    if(Array.isArray(s) && s.length) return s;
  }catch{}
  const seed = +(100 + Math.random()*3).toFixed(3);
  return [seed];
}
function setSeries(arr){ localStorage.setItem(K.PRICE_SER, JSON.stringify(arr)); }
function last(a){ return a[a.length-1]; }

// Lane totals + my bets
function getTotals(){
  return {
    up: parseFloat(localStorage.getItem(K.UP_TOTAL) || '0'),
    down: parseFloat(localStorage.getItem(K.DOWN_TOTAL) || '0')
  };
}
function setTotals(up,down){
  localStorage.setItem(K.UP_TOTAL, String(up));
  localStorage.setItem(K.DOWN_TOTAL, String(down));
  upEl.textContent = fmt(up);
  downEl.textContent = fmt(down);
}
function getMyBets(){
  try{ return JSON.parse(localStorage.getItem(K.MY_BETS)||'[]'); }catch{ return []; }
}
function setMyBets(b){ localStorage.setItem(K.MY_BETS, JSON.stringify(b)); }

// ----- Chart (Chart.js with smooth in-between animation) -----
const ctx = document.getElementById('priceChart').getContext('2d');
let series = getSeries();
let upColor = '#00d27a', downColor = '#ff4d4f';

function gradient(up=true){
  const g = ctx.createLinearGradient(0,0,0,360);
  if(up){ g.addColorStop(0,'rgba(0,210,122,.18)'); g.addColorStop(1,'rgba(0,210,122,.04)'); }
  else  { g.addColorStop(0,'rgba(255,77,79,.16)'); g.addColorStop(1,'rgba(255,77,79,.04)'); }
  return g;
}

const chart = new Chart(ctx, {
  type:'line',
  data:{ labels: series.map((_,i)=>i), datasets:[{
    data: series,
    borderColor: upColor,
    backgroundColor: gradient(true),
    borderWidth: 2.4,
    pointRadius: 0,
    tension: 0.35,
    fill: true
  }]},
  options:{
    animation:false,
    plugins:{ legend:{display:false}, tooltip:{enabled:false} },
    scales:{ x:{display:false}, y:{display:false} },
    responsive:true, maintainAspectRatio:false
  }
});

// Smooth price engine:
// - every 900ms choose a target
// - interpolate per frame (requestAnimationFrame) for smooth movement
let targetPrice = last(series);
let startPrice = targetPrice;
let lerpStart = 0;
const SEG_MS = 900;

function chooseNextTarget(){
  const base = targetPrice;
  const drift = (Math.random() - 0.5) * 1.6;      // small random drift
  const next = Math.max(50, +(base + drift).toFixed(3));
  startPrice = targetPrice;
  targetPrice = next;
  lerpStart = performance.now();
}
setInterval(chooseNextTarget, SEG_MS);

function tickFrame(t){
  const p = Math.min(1, (t - lerpStart) / SEG_MS);
  const val = startPrice + (targetPrice - startPrice) * p;
  const prev = last(series);
  const up = val >= prev;

  // push point per frame (limit length)
  series.push(+val.toFixed(3));
  if(series.length > 240) series.shift();
  chart.data.datasets[0].data = series;
  chart.data.datasets[0].borderColor = up ? upColor : downColor;
  chart.data.datasets[0].backgroundColor = gradient(up);
  chart.update('none');

  // floating ticker
  priceVal.textContent = '$' + (+val).toFixed(3);
  priceArrow.textContent = up ? '▲' : '▼';

  setSeries(series);
  requestAnimationFrame(tickFrame);
}
requestAnimationFrame(tickFrame);

// Round state derived from epoch (refresh-safe)
function computeState(){
  const epoch = getEpoch();
  const elapsed = Math.floor((now() - epoch)/1000);
  const pos = elapsed % CYCLE;
  const inBet = pos < BET_WINDOW;
  const timeLeft = inBet ? (BET_WINDOW - pos) : (CYCLE - pos);
  phaseEl.textContent = inBet ? 'BETTING' : 'RESULT';
  timerEl.textContent = timeLeft + 's';
  return {pos, inBet, timeLeft};
}

// Init labels
roundEl.textContent = getRound();
const t0 = getTotals(); setTotals(t0.up, t0.down);

// Players (demo)
setInterval(()=>{ playersEl.textContent = Math.floor(20 + Math.random()*30); }, 1500);

// Record start price per round (used to decide result by movement)
function getStartPrice(){
  let p = parseFloat(localStorage.getItem(K.START_PRICE)||'NaN');
  if(Number.isNaN(p)){ p = last(series); localStorage.setItem(K.START_PRICE, String(p)); }
  return p;
}
function setStartPrice(v){ localStorage.setItem(K.START_PRICE, String(v)); }
if(Number.isNaN(parseFloat(localStorage.getItem(K.START_PRICE)))) setStartPrice(last(series));

// Round handling: detect boundary and roll forward
let lastPos = -1;
setInterval(()=>{
  const s = computeState();
  // new cycle start
  if(s.pos === 0 && lastPos !== 0){
    // new round
    setEpoch(now()); // align epoch exactly
    setRound(getRound()+1);
    setStartPrice(last(series));
    // clear pool totals
    setTotals(0,0);
    // clear my pending bets (only carry historical if you want)
    const mine = getMyBets().filter(b => b.round !== getRound()); // drop prev round bets
    setMyBets(mine);
    log(`Round #${getRound()} started`);
  }
  // transition to result window
  if(s.pos === BET_WINDOW && lastPos !== BET_WINDOW){
    settleRound(); // decide and pay once
  }
  lastPos = s.pos;
}, 250);

// Place bet
function placeBet(side){
  const s = computeState();
  if(!s.inBet){ toast('Betting closed. Wait for next round.'); return; }
  const amt = parseFloat($('betAmount').value || '0');
  if(!(amt > 0)) return toast('Enter a valid amount');
  if(balance < amt) return toast('Insufficient balance');

  balance = +(balance - amt).toFixed(2);
  setBalance(balance);

  // lane totals
  const tot = getTotals();
  if(side==='up') tot.up += amt; else tot.down += amt;
  setTotals(tot.up, tot.down);

  // save my bet tied to current round (can place multiple)
  const my = getMyBets();
  my.push({ round: getRound(), side, amount: amt });
  setMyBets(my);

  log(`You bet $${fmt(amt)} on ${side.toUpperCase()}`);
}
$('betUp').addEventListener('click', ()=> placeBet('up'));
$('betDown').addEventListener('click', ()=> placeBet('down'));

// Settle: compare current price vs start price; pay winners 2x
function settleRound(){
  const sp = getStartPrice();
  const ep = last(series);
  const result = ep >= sp ? 'up' : 'down';

  const my = getMyBets().filter(b => b.round === getRound());
  if(my.length){
    let credit = 0;
    my.forEach(b=>{
      if(b.side === result) credit += (b.amount * 2); // even-money 2x
    });
    if(credit>0){
      balance = +(balance + credit).toFixed(2);
      setBalance(balance);
      log(`Result ${result.toUpperCase()} • You won +$${fmt(credit)}`);
    }else{
      log(`Result ${result.toUpperCase()} • You lost`);
    }
  }else{
    log(`Result ${result.toUpperCase()}`);
  }
}

// Activity
function log(text){
  const row = document.createElement('div');
  row.className = 'row';
  const t = new Date().toLocaleTimeString();
  row.innerHTML = `<span>${t}</span><span>${text}</span>`;
  activity.querySelector('.hint')?.remove();
  activity.prepend(row);
  while(activity.children.length > 40) activity.lastChild.remove();
}
function toast(msg){ log(msg); }

// Deposit / Withdraw (frontend only)
$('btnDeposit').addEventListener('click', ()=> openModal('depositModal'));
$('btnWithdraw').addEventListener('click', ()=> openModal('withdrawModal'));
document.querySelectorAll('[data-close]').forEach(b=>{
  b.addEventListener('click', e=> closeModal(e.currentTarget.getAttribute('data-close')));
});
function openModal(id){ document.getElementById(id).classList.remove('hidden'); }
function closeModal(id){ document.getElementById(id).classList.add('hidden'); }

$('copyWallet').addEventListener('click', async()=>{
  const text = $('depositWallet').textContent.trim();
  try{ await navigator.clipboard.writeText(text); toast('Wallet copied'); }catch{ toast('Copy failed'); }
});
$('submitDeposit').addEventListener('click', ()=>{
  const txn = $('depositTxn').value.trim();
  if(!txn) return toast('Enter transaction id');
  toast('Deposit submitted. Waiting admin approval.');
  $('depositTxn').value='';
  closeModal('depositModal');
});
$('submitWithdraw').addEventListener('click', ()=>{
  const amt = parseFloat($('wdAmount').value||'0');
  const wal = $('wdWallet').value.trim();
  if(!(amt>=5)) return toast('Minimum $5 withdrawal');
  if(!wal) return toast('Enter destination wallet');
  toast('Withdraw request sent for approval.');
  $('wdAmount').value=''; $('wdWallet').value='';
  closeModal('withdrawModal');
});
