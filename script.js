/* Market Battle — Frontend demo (bots both sides 8–20 each round) */

/* --------------- Persistence keys --------------- */
const K = {
  BAL: 'mb_bal_v1',
  SERIES: 'mb_series_v1',
  EPOCH: 'mb_epoch_v1',
  ROUND: 'mb_round_v1',
  START_PRICE: 'mb_start_price_v1',
  UP_TOTAL: 'mb_up_total_v1',
  DOWN_TOTAL: 'mb_down_total_v1',
  MY_BETS: 'mb_my_bets_v1',
  DEPOSITS: 'mb_deposits_v1'
};

/* --------------- Config --------------- */
const BET_WINDOW = 20;
const RESULT_WINDOW = 5;
const CYCLE = BET_WINDOW + RESULT_WINDOW;
const BOT_MIN = 8, BOT_MAX = 20;
const BOT_MIN_AMT = 0.5, BOT_MAX_AMT = 25;

/* --------------- Helpers / DOM --------------- */
const $ = id => document.getElementById(id);
const fmt = n => Number(n).toFixed(2);
const now = () => Date.now();

/* DOM refs */
const balEl = $('balance'), roundEl = $('roundNum'), phaseEl = $('phase'),
      timerEl = $('timer'), playersEl = $('players') || { textContent: '' },
      upTotalEl = $('upTotal'), downTotalEl = $('downTotal'),
      upBotsList = $('upBotsList'), downBotsList = $('downBotsList'),
      activity = $('activity'), priceVal = $('priceVal'), priceArrow = $('priceArrow');

/* --------------- Initial state --------------- */
// balance: welcome $1 if unset
let balance = parseFloat(localStorage.getItem(K.BAL));
if (!Number.isFinite(balance)) { balance = 1; localStorage.setItem(K.BAL, String(balance)); }
balEl.textContent = fmt(balance);

// series: price points
let series = (() => {
  try { const s = JSON.parse(localStorage.getItem(K.SERIES) || '[]'); if (Array.isArray(s) && s.length) return s; } catch {}
  const seed = +(100 + Math.random()*3).toFixed(3);
  return [seed];
})();
localStorage.setItem(K.SERIES, JSON.stringify(series));

// epoch/round/start price
function getEpoch(){ let e = parseInt(localStorage.getItem(K.EPOCH) || '0',10); if(!e){ e = now(); localStorage.setItem(K.EPOCH, String(e)); } return e; }
function setEpoch(t){ localStorage.setItem(K.EPOCH, String(t)); }
function getRound(){ let r = parseInt(localStorage.getItem(K.ROUND) || '1',10); if(!r){ r = 1; localStorage.setItem(K.ROUND,'1'); } return r; }
function setRound(n){ localStorage.setItem(K.ROUND, String(n)); roundEl.textContent = n; }
function getStartPrice(){ return parseFloat(localStorage.getItem(K.START_PRICE) || String(series[series.length-1])); }
function setStartPrice(v){ localStorage.setItem(K.START_PRICE, String(v)); }

let epoch = getEpoch();
let roundNum = getRound();
roundEl.textContent = roundNum;
if (!localStorage.getItem(K.START_PRICE)) setStartPrice(series[series.length-1]);

// totals & my bets
let totals = { up: parseFloat(localStorage.getItem(K.UP_TOTAL) || '0'), down: parseFloat(localStorage.getItem(K.DOWN_TOTAL) || '0') };
upTotalEl.textContent = fmt(totals.up); downTotalEl.textContent = fmt(totals.down);
let myBets = (()=> { try{ return JSON.parse(localStorage.getItem(K.MY_BETS)||'[]'); }catch{return [];} })();

/* --------------- Chart setup --------------- */
const ctx = document.getElementById('priceChart').getContext('2d');
let upColor = '#00d27a', downColor = '#ff4d4f';
function gradient(up=true){
  const g = ctx.createLinearGradient(0,0,0,360);
  if(up){ g.addColorStop(0,'rgba(0,210,122,.18)'); g.addColorStop(1,'rgba(0,210,122,.04)'); }
  else { g.addColorStop(0,'rgba(255,77,79,.16)'); g.addColorStop(1,'rgba(255,77,79,.04)'); }
  return g;
}
const chart = new Chart(ctx, {
  type:'line',
  data:{ labels: series.map((_,i)=>i), datasets:[{
    data: series,
    borderColor: upColor,
    backgroundColor: gradient(true),
    borderWidth:2.4, pointRadius:0, tension:0.35, fill:true
  }]},
  options:{ animation:false, plugins:{legend:{display:false},tooltip:{enabled:false}}, scales:{x:{display:false}, y:{display:false}}, responsive:true, maintainAspectRatio:false }
});

/* --------------- Smooth price engine --------------- */
let target = series[series.length-1];
let start = target;
let segStart = performance.now();
const SEG_MS = 900;
function pickTarget(){
  const drift = (Math.random()-0.5)*1.6;
  start = target;
  target = Math.max(10, +(target + drift).toFixed(3));
  segStart = performance.now();
}
setInterval(pickTarget, SEG_MS);

function frame(ts){
  const p = Math.min(1, (ts - segStart)/SEG_MS);
  const current = start + (target - start) * p;
  // push every frame but keep size reasonable
  series.push(+current.toFixed(3));
  if(series.length > 240) series.shift();
  chart.data.datasets[0].data = series;
  const up = current >= series[series.length-2];
  chart.data.datasets[0].borderColor = up ? upColor : downColor;
  chart.data.datasets[0].backgroundColor = gradient(up);
  chart.update('none');

  // floating price
  if (priceVal) priceVal.textContent = '$' + (+current).toFixed(3);
  if (priceArrow) priceArrow.textContent = up ? '▲' : '▼';

  localStorage.setItem(K.SERIES, JSON.stringify(series));
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

/* --------------- Round state computed from epoch (refresh-safe) --------------- */
function computeState(){
  const elapsed = Math.floor((now() - epoch)/1000);
  const pos = elapsed % CYCLE;
  const inBet = pos < BET_WINDOW;
  const timeLeft = inBet ? (BET_WINDOW - pos) : (CYCLE - pos);
  phaseEl.textContent = inBet ? 'BETTING' : 'RESULT';
  timerEl.textContent = timeLeft + 's';
  return {pos, inBet, timeLeft};
}

/* --------------- Bots generator (both sides 8–20 each) --------------- */
const BOT_NAMES = ['Alpha','Beta','CryptoKing','NehaX','Rahul23','Satoshi','Luna','Mira','Vikram','Zara','Khan','Jai','Priya','Robo1','TraderZ','Nina','Sai','Rex','Kira','Leo','Tara','Ishan','Maya','Oz','Kai','Rohit','Asha'];
function randName(){ return BOT_NAMES[Math.floor(Math.random()*BOT_NAMES.length)] + Math.floor(Math.random()*90+10); }
function randAmt(){ return +(Math.random()*(BOT_MAX_AMT - BOT_MIN_AMT) + BOT_MIN_AMT).toFixed(2); }
function makeAvatarInitials(name){ return name.split(/[^A-Za-z0-9]/).map(s=>s[0]).slice(0,2).join('').toUpperCase(); }

function genBotsForSide(count, side){
  const arr = [];
  for(let i=0;i<count;i++){
    const name = randName();
    arr.push({ id: name + '_' + Math.floor(Math.random()*99999), name, avatar: makeAvatarInitials(name), amount: randAmt(), side });
  }
  return arr;
}

/* Render bots lists to UI */
function renderBots(upBots, downBots){
  upBotsList.innerHTML = upBots.map(b => `
    <div class="bot"><div class="avatar" style="background:#0b2">${b.avatar}</div>
    <div class="meta"><div class="name">${b.name}</div><div class="meta-sub">${b.side.toUpperCase()}</div></div>
    <div class="amt">$${fmt(b.amount)}</div></div>`).join('');
  downBotsList.innerHTML = downBots.map(b => `
    <div class="bot"><div class="avatar" style="background:#f66">${b.avatar}</div>
    <div class="meta"><div class="name">${b.name}</div><div class="meta-sub">${b.side.toUpperCase()}</div></div>
    <div class="amt">$${fmt(b.amount)}</div></div>`).join('');
}

/* --------------- Round lifecycle --------------- */
let lastPos = -1;
let currentUpBots = [], currentDownBots = [];

setInterval(()=>{
  const s = computeState();

  // start of new cycle (pos==0)
  if (s.pos === 0 && lastPos !== 0){
    // new round
    epoch = now(); setEpoch(epoch);
    roundNum = getRound() + 1; setRound(roundNum);
    // pick start price
    setStartPrice(series[series.length-1]);
    // generate bots (both sides)
    const upCount = Math.floor(Math.random()*(BOT_MAX-BOT_MIN+1)) + BOT_MIN;
    const downCount = Math.floor(Math.random()*(BOT_MAX-BOT_MIN+1)) + BOT_MIN;
    currentUpBots = genBotsForSide(upCount, 'up');
    currentDownBots = genBotsForSide(downCount, 'down');

    // update totals
    let upTot = currentUpBots.reduce((s,b)=>s+b.amount, 0);
    let downTot = currentDownBots.reduce((s,b)=>s+b.amount, 0);
    totals.up = +(upTot + parseFloat(localStorage.getItem(K.UP_TOTAL) || 0)).toFixed(2);
    totals.down = +(downTot + parseFloat(localStorage.getItem(K.DOWN_TOTAL) || 0)).toFixed(2);
    setTotals(totals.up, totals.down);

    // persist bots for UI (not storing all rounds to keep small)
    renderBots(currentUpBots, currentDownBots);
    log(`Round ${getRound()} started • Bots: UP ${upCount}, DOWN ${downCount}`);
  }

  // when bet window ends (enter result)
  if (s.pos === BET_WINDOW && lastPos !== BET_WINDOW){
    // settle round now
    settleRoundOnce();
  }

  lastPos = s.pos;
}, 300);

/* --------------- placeBet (user) --------------- */
function placeBetUser(side){
  const amt = parseFloat($('betAmount').value || '0');
  if(!(amt > 0)) return toast('Enter valid amount');
  const s = computeState();
  if(!s.inBet) return toast('Betting closed for this round');
  if(balance < amt) return toast('Insufficient balance');

  balance = +(balance - amt).toFixed(2); setBalance(balance);
  // increase totals
  if(side==='up') totals.up = +(totals.up + amt).toFixed(2); else totals.down = +(totals.down + amt).toFixed(2);
  setTotals(totals.up, totals.down);

  // record my bet
  myBets.push({ round:getRound(), side, amount:amt });
  localStorage.setItem(K.MY_BETS, JSON.stringify(myBets));

  log(`You bet $${fmt(amt)} on ${side.toUpperCase()}`);
  // update small players count
}
$('betUp').addEventListener('click', ()=> placeBetUser('up'));
$('betDown').addEventListener('click', ()=> placeBetUser('down'));

/* Persist and UI helpers */
function setBalance(v){ localStorage.setItem(K.BAL, String(v)); balEl.textContent = fmt(v); balance = v; }
function setTotals(u,d){ localStorage.setItem(K.UP_TOTAL, String(u)); localStorage.setItem(K.DOWN_TOTAL, String(d)); upTotalEl.textContent = fmt(u); downTotalEl.textContent = fmt(d); }

/* --------------- settleRoundOnce --------------- */
let settledRounds = new Set();
function settleRoundOnce(){
  const r = getRound();
  if (settledRounds.has(r)) return;
  settledRounds.add(r);

  const startPrice = parseFloat(localStorage.getItem(K.START_PRICE) || series[0]);
  const endPrice = series[series.length-1];
  const result = endPrice >= startPrice ? 'up' : 'down';

  // pay my bets for this round
  const roundBets = myBets.filter(b=>b.round === r);
  let credit = 0;
  roundBets.forEach(b=>{
    if(b.side === result){
      credit += b.amount * 2; // 2x payout (stake returned + win)
    }
  });
  if(credit > 0){
    setBalance(+(balance + credit).toFixed(2));
    log(`Result ${result.toUpperCase()} • You won +$${fmt(credit)}`);
  } else {
    log(`Result ${result.toUpperCase()} • You had no winning bets`);
  }

  // show bots results in activity (simulate winners)
  const upWinner = result === 'up';
  let upWin = currentUpBots.filter(b=> b.side==='up').reduce((s,b)=> s + (upWinner ? b.amount*2 : 0), 0);
  let downWin = currentDownBots.filter(b=> b.side==='down').reduce((s,b)=> s + (!upWinner ? b.amount*2 : 0), 0);
  log(`Bots • UP total $${fmt(totals.up)} • DOWN total $${fmt(totals.down)} • Result ${result.toUpperCase()}`);

  // clear myBets for this round entries (they remain in history if you want)
  myBets = myBets.filter(b => b.round !== r);
  localStorage.setItem(K.MY_BETS, JSON.stringify(myBets));

  // after result, schedule clearing of bots after short delay so next round shows fresh bots
  setTimeout(()=>{
    currentUpBots = []; currentDownBots = [];
    renderBots([], []);
    // reset totals for next round (they will be recalculated when new bots are generated)
    setTotals(0,0);
    settledRounds.delete(r);
  }, 1800);
}

/* --------------- Activity / UI --------------- */
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

/* --------------- Players demo count --------------- */
setInterval(()=>{ if(playersEl) playersEl.textContent = Math.floor(30 + Math.random()*40); }, 1500);

/* --------------- Deposit / Withdraw UI --------------- */
$('openDeposit').addEventListener('click', ()=> openModal('depositModal'));
$('openWithdraw').addEventListener('click', ()=> openModal('withdrawModal'));
document.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', e => closeModal(e.currentTarget.getAttribute('data-close'))));
function openModal(id){ document.getElementById(id).classList.remove('hidden'); }
function closeModal(id){ document.getElementById(id).classList.add('hidden'); }

$('copyWalletBtn').addEventListener('click', async()=>{
  const t = $('walletAddr').textContent.trim();
  try{ await navigator.clipboard.writeText(t); toast('Wallet copied'); }catch{ toast('Copy failed'); }
});
$('editWalletBtn').addEventListener('click', ()=> {
  const v = prompt('Set your wallet address', $('walletAddr').textContent);
  if(v){ $('walletAddr').textContent = v; $('depositWallet').textContent = v; localStorage.setItem('user_wallet', v); }
});

$('copyDepositWallet').addEventListener('click', async()=>{
  const t = $('depositWallet').textContent.trim();
  try{ await navigator.clipboard.writeText(t); toast('Deposit wallet copied'); }catch{ toast('Copy failed'); }
});

$('submitDeposit').addEventListener('click', ()=>{
  const txn = $('depositTxn').value.trim();
  if(!txn){ toast('Enter transaction id'); return; }
  const arr = JSON.parse(localStorage.getItem(K.DEPOSITS) || '[]');
  arr.push({ txn, ts: Date.now(), status: 'pending'});
  localStorage.setItem(K.DEPOSITS, JSON.stringify(arr));
  $('depositTxn').value = '';
  toast('Deposit submitted — pending admin approval');
  closeModal('depositModal');
});

$('submitWithdraw').addEventListener('click', ()=>{
  const amt = parseFloat($('wdAmount').value||'0'); const wal = $('wdWallet').value.trim();
  if(!(amt>=5)){ $('withdrawMsg').textContent = 'Minimum $5 required'; return; }
  if(amt > balance){ $('withdrawMsg').textContent = 'Insufficient balance'; return; }
  if(!wal){ $('withdrawMsg').textContent = 'Enter wallet address'; return; }
  // keep demo: mark withdraw requested
  $('withdrawMsg').textContent = 'Withdraw request submitted — pending admin';
  // optionally deduct locally to simulate
  balance = +(balance - amt).toFixed(2);
  setBalance(balance);
  $('wdAmount').value=''; $('wdWallet').value='';
  closeModal('withdrawModal');
});

/* --------------- Init UI --------------- */
renderBots([], []);
setTotals(totals.up, totals.down);
log('Welcome — demo started. Welcome bonus $1 applied (first time).');
