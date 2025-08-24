/* ---------------- Config ---------------- */
const BACKEND_URL = "https://betwin-winn.onrender.com"; // ya local: "http://localhost:5000"

/* ---------------- Helpers ---------------- */
const $ = id => document.getElementById(id);
const fmt = n => Number(n).toFixed(2);

/* ---------------- User State ---------------- */
let balance = 0;
let myBets = [];

/* ---------------- DOM Elements ---------------- */
const balEl = $('balance');
const roundEl = $('roundNum');
const phaseEl = $('phase');
const timerEl = $('timer');
const playersEl = $('players');
const upTotalEl = $('upTotal');
const downTotalEl = $('downTotal');
const upBotsList = $('upBotsList');
const downBotsList = $('downBotsList');
const activity = $('activity');
const priceVal = $('priceVal');
const priceArrow = $('priceArrow');

/* ---------------- Chart Setup ---------------- */
const ctx = document.getElementById('priceChart').getContext('2d');
let series = [100];
let upColor = '#00d27a', downColor = '#ff4d4f';
function gradient(up=true){
  const g = ctx.createLinearGradient(0,0,0,360);
  if(up){ g.addColorStop(0,'rgba(0,210,122,.18)'); g.addColorStop(1,'rgba(0,210,122,.04)'); }
  else { g.addColorStop(0,'rgba(255,77,79,.16)'); g.addColorStop(1,'rgba(255,77,79,.04)'); }
  return g;
}
const chart = new Chart(ctx, {
  type:'line',
  data:{ labels: series.map((_,i)=>i), datasets:[{ data: series, borderColor: upColor, backgroundColor: gradient(true), borderWidth:2.4, pointRadius:0, tension:0.35, fill:true }]},
  options:{ animation:false, plugins:{legend:{display:false},tooltip:{enabled:false}}, scales:{x:{display:false}, y:{display:false}}, responsive:true, maintainAspectRatio:false }
});

/* ---------------- Smooth price engine ---------------- */
let target = series[0];
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
  series.push(+current.toFixed(3));
  if(series.length > 240) series.shift();
  chart.data.datasets[0].data = series;
  const up = current >= series[series.length-2];
  chart.data.datasets[0].borderColor = up ? upColor : downColor;
  chart.data.datasets[0].backgroundColor = gradient(up);
  chart.update('none');

  if (priceVal) priceVal.textContent = '$' + (+current).toFixed(3);
  if (priceArrow) priceArrow.textContent = up ? '▲' : '▼';

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

/* ---------------- Bets ---------------- */
$('betUp').addEventListener('click', ()=> placeBet('up'));
$('betDown').addEventListener('click', ()=> placeBet('down'));

async function placeBet(side){
  const amt = parseFloat($('betAmount').value || '0');
  if(!(amt>0)) return toast('Enter valid amount');
  if(balance < amt) return toast('Insufficient balance');

  // Send bet to backend
  try{
    const res = await fetch(BACKEND_URL+'/bet', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ side, amount: amt })
    });
    const data = await res.json();
    if(data.ok){
      balance -= amt;
      setBalance(balance);
      myBets.push({ side, amount: amt });
      log(`You bet $${fmt(amt)} on ${side.toUpperCase()}`);
    } else toast(data.msg || 'Bet failed');
  }catch(e){ toast('Server error'); }
}

/* ---------------- Deposit ---------------- */
$('submitDeposit').addEventListener('click', async ()=>{
  const txn = $('depositTxn').value.trim();
  const wallet = $('depositWalletSelect').value;
  if(!txn) return toast('Enter transaction ID');
  try{
    const res = await fetch(BACKEND_URL+'/deposit', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ txn, wallet })
    });
    const data = await res.json();
    if(data.ok){ toast('Deposit submitted — pending approval'); $('depositTxn').value=''; closeModal('depositModal'); }
    else toast(data.msg || 'Deposit failed');
  }catch(e){ toast('Server error'); }
});

/* ---------------- Withdraw ---------------- */
$('submitWithdraw').addEventListener('click', async ()=>{
  const amt = parseFloat($('wdAmount').value||'0');
  const wal = $('wdWallet').value.trim();
  if(!(amt>=5)) return $('withdrawMsg').textContent='Minimum $5 required';
  if(amt > balance) return $('withdrawMsg').textContent='Insufficient balance';
  try{
    const res = await fetch(BACKEND_URL+'/withdraw', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ amount: amt, wallet: wal })
    });
    const data = await res.json();
    if(data.ok){
      balance -= amt;
      setBalance(balance);
      $('wdAmount').value=''; $('wdWallet').value=''; $('withdrawMsg').textContent='Withdraw request submitted';
      closeModal('withdrawModal');
    }else $('withdrawMsg').textContent=data.msg||'Withdraw failed';
  }catch(e){ $('withdrawMsg').textContent='Server error'; }
});

/* ---------------- Utility ---------------- */
function setBalance(v){ balance=v; balEl.textContent=fmt(v); }
function log(msg){ const row=document.createElement('div'); row.innerHTML=`<span>${new Date().toLocaleTimeString()}</span> <span>${msg}</span>`; activity.prepend(row); while(activity.children.length>40) activity.lastChild.remove(); }
function toast(msg){ log(msg); }

/* ---------------- Modal ---------------- */
document.querySelectorAll('[data-close]').forEach(btn=>btn.addEventListener('click', e=>closeModal(e.getAttribute('data-close'))));
function openModal(id){ document.getElementById(id).classList.remove('hidden'); }
function closeModal(id){ document.getElementById(id).classList.add('hidden'); }

/* ---------------- Init ---------------- */
setBalance(balance);
log('Welcome — connected to backend!');
