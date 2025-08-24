// ---------- CONFIG ----------
const STORAGE = {
  BAL: 'mb_balance_v1',
  PTS: 'mb_points_v1',
  WELCOME: 'mb_welcome_v1',
  ROUND: 'mb_round_v1',
  PHASE: 'mb_phase_v1',
  TIMER: 'mb_timer_v1',
  TOTALS: 'mb_totals_v1',
  DEPOSITS: 'mb_deposits_v1',
  WALLET: 'mb_wallet_v1',
};
const ROUND_BET_SECS = 20;
const ROUND_RES_SECS = 5;

// ---------- STATE ----------
let balance = parseFloat(localStorage.getItem(STORAGE.BAL) || '0');
let points = JSON.parse(localStorage.getItem(STORAGE.PTS) || '[]');
let phase = localStorage.getItem(STORAGE.PHASE) || 'bet'; // 'bet' | 'result'
let timer = parseInt(localStorage.getItem(STORAGE.TIMER) || (phase==='bet'?ROUND_BET_SECS:ROUND_RES_SECS));
let round = parseInt(localStorage.getItem(STORAGE.ROUND) || '1');
let totals = JSON.parse(localStorage.getItem(STORAGE.TOTALS) || '{"up":0,"down":0}');
let lastPrice = points.length ? points[points.length-1] : 100 + Math.random()*5;

// welcome bonus once
if(!localStorage.getItem(STORAGE.WELCOME)){
  balance = +(balance + 1).toFixed(2);
  localStorage.setItem(STORAGE.WELCOME,'1');
  toast('Welcome bonus +$1');
}
syncBalance();

// ---------- UI REFS ----------
const el = id => document.getElementById(id);
const priceVal = el('priceVal'), priceArrow = el('priceArrow');
const roundId = el('roundId'), phaseEl = el('phase'), timerEl = el('timer'), playersEl = el('players');
const upTotalEl = el('upTotal'), downTotalEl = el('downTotal');
const betAmount = el('betAmount');
const activity = el('activity');

// ---------- CHART ----------
const ctx = document.getElementById('priceChart').getContext('2d');
if(points.length === 0){
  points = Array.from({length:50}, (_,i)=> +(lastPrice + (Math.random()-0.5)*0.8).toFixed(3));
}
const chart = new Chart(ctx, {
  type:'line',
  data:{
    labels: points.map((_,i)=>i),
    datasets:[{
      data: points,
      borderWidth: 2.6,
      borderColor: '#02d37a',
      backgroundColor: makeGradient(true),
      fill: true,
      tension: 0.35,
      pointRadius: 0
    }]
  },
  options:{
    animation:false,
    plugins:{legend:{display:false}, tooltip:{enabled:false}},
    scales:{x:{display:false}, y:{display:false}},
    responsive:true, maintainAspectRatio:false
  }
});
updateFloating(points[points.length-1]);

function makeGradient(up=true){
  const g = ctx.createLinearGradient(0,0,0,360);
  if(up){ g.addColorStop(0,'rgba(2,211,122,.18)'); g.addColorStop(1,'rgba(2,211,122,.02)'); }
  else { g.addColorStop(0,'rgba(255,77,79,.16)'); g.addColorStop(1,'rgba(255,77,79,.02)'); }
  return g;
}

function pushPrice(){
  const drift = (Math.random()-0.52)*0.35; // small random
  const next = Math.max(0.01, +(points[points.length-1] + drift).toFixed(3));
  points.push(next);
  if(points.length>220) points.shift();
  const up = next >= points[points.length-2];
  chart.data.datasets[0].data = points;
  chart.data.datasets[0].borderColor = up ? '#02d37a' : '#ff4d4f';
  chart.data.datasets[0].backgroundColor = makeGradient(up);
  chart.update('none');
  updateFloating(next);
  localStorage.setItem(STORAGE.PTS, JSON.stringify(points));
}

function updateFloating(val){
  priceVal.textContent = '$' + (+val).toFixed(3);
  const up = points.length<2 || val >= points[points.length-2];
  priceArrow.textContent = up ? '▲' : '▼';
}

// smooth ticker
setInterval(pushPrice, 900);

// ---------- ROUND ENGINE ----------
function tick(){
  timer--;
  if(timer < 0){
    if(phase === 'bet'){
      phase = 'result';
      timer = ROUND_RES_SECS;
      resolveRound();
    } else {
      phase = 'bet';
      timer = ROUND_BET_SECS;
      startNewRound();
    }
    localStorage.setItem(STORAGE.PHASE, phase);
  }
  renderRound();
  localStorage.setItem(STORAGE.TIMER, String(timer));
}
setInterval(tick, 1000);

function renderRound(){
  roundId.textContent = String(round);
  phaseEl.textContent = (phase==='bet' ? 'BET' : 'RESULT');
  timerEl.textContent = `${timer}s`;
  playersEl.textContent = Math.max(1, Math.floor((totals.up+totals.down)/2)+1);
  upTotalEl.textContent = (+totals.up).toFixed(2);
  downTotalEl.textContent = (+totals.down).toFixed(2);
  localStorage.setItem(STORAGE.TOTALS, JSON.stringify(totals));
}

function startNewRound(){
  round++;
  totals = { up:0, down:0 };
  save(STORAGE.ROUND, round);
  save(STORAGE.TOTALS, totals);
  log(`Round ${round} started. Place your bets!`);
}

function resolveRound(){
  const end = points[points.length-1];
  const start = points[points.length-25] ?? points[0];
  const result = end >= start ? 'up' : 'down';
  let win = 0;
  if(result==='up' && totals.up>0) win = totals.up*2;
  if(result==='down' && totals.down>0) win = totals.down*2;
  if(win>0){
    balance = +(balance + win).toFixed(2);
    syncBalance();
  }
  log(`Round ${round} result: <b>${result.toUpperCase()}</b> • start ${start.toFixed(3)} → end ${end.toFixed(3)} • payout $${win.toFixed(2)}`);
}

function placeBet(side){
  if(phase!=='bet'){ toast('Betting closed. Wait for next round.'); return; }
  const amt = parseFloat(betAmount.value);
  if(!amt || amt<=0){ toast('Enter valid amount'); return; }
  if(balance < amt){ toast('Insufficient balance'); return; }
  balance = +(balance - amt).toFixed(2);
  totals[side] = +(totals[side] + amt).toFixed(2);
  syncBalance();
  renderRound();
  log(`You bet $${amt.toFixed(2)} on <b>${side.toUpperCase()}</b>`);
}

document.getElementById('betUp').addEventListener('click', ()=> placeBet('up'));
document.getElementById('betDown').addEventListener('click', ()=> placeBet('down'));

// ---------- BALANCE ----------
function syncBalance(){
  localStorage.setItem(STORAGE.BAL, String(balance));
  el('balance').textContent = (+balance).toFixed(2);
}

// ---------- ACTIVITY ----------
function log(html){
  const row = document.createElement('div');
  row.innerHTML = `<div class="row">${html}</div>`;
  activity.prepend(row);
  while(activity.childElementCount>12){ activity.lastElementChild.remove(); }
}

// ---------- UTIL ----------
function save(k,v){ localStorage.setItem(k, typeof v==='string'?v:JSON.stringify(v)); }
function toast(msg){ console.log('[toast]', msg); /* simple console toast; replace with UI if needed */ }

// ---------- INIT ----------
renderRound();

// ---------- MODALS ----------
const depModal = document.getElementById('depositModal');
const wdModal = document.getElementById('withdrawModal');
document.getElementById('depositOpen').addEventListener('click', ()=> depModal.style.display='flex');
document.getElementById('withdrawOpen').addEventListener('click', ()=> wdModal.style.display='flex');
document.getElementById('depositClose').addEventListener('click', ()=> depModal.style.display='none');
document.getElementById('withdrawClose').addEventListener('click', ()=> wdModal.style.display='none');
document.addEventListener('click', (e)=>{
  if(e.target===depModal) depModal.style.display='none';
  if(e.target===wdModal) wdModal.style.display='none';
});

// deposit helpers
const depWalletEl = document.getElementById('depWallet');
const depStored = localStorage.getItem(STORAGE.WALLET);
if(depStored) depWalletEl.textContent = depStored;

document.getElementById('copyWallet').addEventListener('click', async()=>{
  try{ await navigator.clipboard.writeText(depWalletEl.textContent); toast('Wallet copied'); }catch{}
});
document.getElementById('changeWallet').addEventListener('click', ()=>{
  const v = prompt('Set deposit wallet address:', depWalletEl.textContent);
  if(v){ depWalletEl.textContent = v; localStorage.setItem(STORAGE.WALLET, v); }
});

document.getElementById('submitDeposit').addEventListener('click', ()=>{
  const txn = document.getElementById('depTxn').value.trim();
  if(!txn) return toast('Enter transaction id');
  const arr = JSON.parse(localStorage.getItem(STORAGE.DEPOSITS) || '[]');
  arr.push({ txn, status:'pending', ts: Date.now() });
  localStorage.setItem(STORAGE.DEPOSITS, JSON.stringify(arr));
  document.getElementById('depTxn').value='';
  renderDeposits();
  toast('Deposit submitted. Await admin approval.');
});
document.getElementById('clearLocalDeposits').addEventListener('click', ()=>{
  if(confirm('Clear local deposit list?')){ localStorage.removeItem(STORAGE.DEPOSITS); renderDeposits(); }
});

function renderDeposits(){
  const box = document.getElementById('depositList');
  const arr = JSON.parse(localStorage.getItem(STORAGE.DEPOSITS) || '[]').slice().reverse();
  box.innerHTML = arr.length? arr.map(d=>`<div>Txn <b>${d.txn}</b> — ${d.status}</div>`).join('') : '<div class="muted">No local deposits</div>';
}
renderDeposits();

// withdraw
document.getElementById('submitWithdraw').addEventListener('click', ()=>{
  const amt = parseFloat(document.getElementById('wdAmount').value);
  const wall = document.getElementById('wdWallet').value.trim();
  const msg = document.getElementById('withdrawMsg');
  if(!amt || amt<5){ msg.textContent='Min $5 required'; return; }
  if(amt>balance){ msg.textContent='Insufficient balance'; return; }
  if(!wall){ msg.textContent='Enter destination wallet'; return; }
  msg.textContent = 'Withdraw request submitted — pending admin approval.';
  document.getElementById('wdAmount').value='';
  document.getElementById('wdWallet').value='';
});
document.getElementById('clearWithdraw').addEventListener('click', ()=>{
  document.getElementById('wdAmount').value='';
  document.getElementById('wdWallet').value='';
  document.getElementById('withdrawMsg').textContent='';
});
