/* --------------- Backend URL --------------- */
const API = 'https://betwin-winn.onrender.com';

/* --------------- Helpers / DOM --------------- */
const $ = id => document.getElementById(id);
const fmt = n => Number(n).toFixed(2);
const now = () => Date.now();

const balEl = $('balance'), roundEl = $('roundNum'), phaseEl = $('phase'),
      timerEl = $('timer'), playersEl = $('players') || { textContent: '' },
      upTotalEl = $('upTotal'), downTotalEl = $('downTotal'),
      upBotsList = $('upBotsList'), downBotsList = $('downBotsList'),
      activity = $('activity'), priceVal = $('priceVal'), priceArrow = $('priceArrow');

/* --------------- Initial state --------------- */
let balance = 0;

async function fetchBalance() {
  try {
    const res = await fetch(`${API}/balance`);
    const data = await res.json();
    balance = data.balance || 0;
    balEl.textContent = fmt(balance);
  } catch(e) {
    console.error(e);
    toast('Failed to fetch balance');
  }
}
fetchBalance();

/* --------------- Chart setup & price engine --------------- */
let series = [100]; // start value
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
  series.push(+current.toFixed(3));
  if(series.length > 240) series.shift();
  chart.data.datasets[0].data = series;
  const up = current >= series[series.length-2];
  chart.data.datasets[0].borderColor = up ? upColor : downColor;
  chart.data.datasets[0].backgroundColor = gradient(up);
  chart.update('none');

  if(priceVal) priceVal.textContent = '$' + (+current).toFixed(3);
  if(priceArrow) priceArrow.textContent = up ? '▲' : '▼';

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

/* --------------- Round & bots (demo only) --------------- */
let BOT_NAMES = ['Alpha','Beta','CryptoKing','NehaX','Rahul23','Satoshi','Luna','Mira','Vikram','Zara'];
function randName(){ return BOT_NAMES[Math.floor(Math.random()*BOT_NAMES.length)] + Math.floor(Math.random()*90+10); }
function randAmt(){ return +(Math.random()*25 + 0.5).toFixed(2); }
function makeAvatarInitials(name){ return name.split(/[^A-Za-z0-9]/).map(s=>s[0]).slice(0,2).join('').toUpperCase(); }
function genBotsForSide(count, side){
  const arr = [];
  for(let i=0;i<count;i++){
    const name = randName();
    arr.push({ id: name + '_' + Math.floor(Math.random()*99999), name, avatar: makeAvatarInitials(name), amount: randAmt(), side });
  }
  return arr;
}
function renderBots(upBots, downBots){
  upBotsList.innerHTML = upBots.map(b => `<div class="bot"><div class="avatar" style="background:#0b2">${b.avatar}</div>
    <div class="meta"><div class="name">${b.name}</div><div class="meta-sub">${b.side.toUpperCase()}</div></div>
    <div class="amt">$${fmt(b.amount)}</div></div>`).join('');
  downBotsList.innerHTML = downBots.map(b => `<div class="bot"><div class="avatar" style="background:#f66">${b.avatar}</div>
    <div class="meta"><div class="name">${b.name}</div><div class="meta-sub">${b.side.toUpperCase()}</div></div>
    <div class="amt">$${fmt(b.amount)}</div></div>`).join('');
}
renderBots([],[]);

/* --------------- Betting --------------- */
async function placeBetUser(side){
  const amt = parseFloat($('betAmount').value || '0');
  if(!(amt > 0)) return toast('Enter valid amount');
  try {
    const res = await fetch(`${API}/bet`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ side, amount: amt })
    });
    const data = await res.json();
    if(data.success){
      balance = data.balance;
      balEl.textContent = fmt(balance);
      toast(`Bet $${fmt(amt)} on ${side.toUpperCase()} placed`);
    } else {
      toast(data.msg || 'Bet failed');
    }
  } catch(e){
    console.error(e);
    toast('Bet failed — server error');
  }
}
$('betUp').addEventListener('click', ()=> placeBetUser('up'));
$('betDown').addEventListener('click', ()=> placeBetUser('down'));

/* --------------- Deposit / Withdraw --------------- */
const DEPOSIT_WALLETS = [
  { chain:'TRC20', addr:'TWZHqkbbYTnehQ2TxnH4NgNt4crGLNy8Ns' },
  { chain:'Polygon', addr:'0xE1D4b2BEC237AEDDB47da56b82b2f15812e45B44' },
  { chain:'BEP20', addr:'0xE1D4b2BEC237AEDDB47da56b82b2f15812e45B44' },
  { chain:'TON', addr:'EQAj7vKLbaWjaNbAuAKP1e1HwmdYZ2vJ2xtWU8qq3JafkfxF' }
];

function initDepositWallets(){
  const depositWalletEl = $('depositWalletSelect');
  DEPOSIT_WALLETS.forEach(w=>{
    const opt = document.createElement('option');
    opt.value = w.addr;
    opt.textContent = `${w.chain}: ${w.addr}`;
    depositWalletEl.appendChild(opt);
  });
  $('copyDepositWallet').addEventListener('click', async()=>{
    try{ await navigator.clipboard.writeText(depositWalletEl.value.trim()); toast('Deposit wallet copied'); }catch{ toast('Copy failed'); }
  });
}
initDepositWallets();

$('submitDeposit').addEventListener('click', async()=>{
  const txn = $('depositTxn').value.trim();
  if(!txn){ toast('Enter transaction ID'); return; }
  try {
    const res = await fetch(`${API}/deposit`, {
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ txn })
    });
    const data = await res.json();
    if(data.success){ toast('Deposit submitted — pending approval'); $('depositTxn').value=''; closeModal('depositModal'); }
    else toast(data.msg || 'Deposit failed');
  } catch(e){ console.error(e); toast('Deposit failed'); }
});

$('submitWithdraw').addEventListener('click', async()=>{
  const amt = parseFloat($('wdAmount').value||'0'); const wal = $('wdWallet').value.trim();
  if(!(amt>=5)){ $('withdrawMsg').textContent='Min $5 required'; return; }
  if(!wal){ $('withdrawMsg').textContent='Enter wallet'; return; }
  try{
    const res = await fetch(`${API}/withdraw`, {
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ amount: amt, wallet: wal })
    });
    const data = await res.json();
    if(data.success){ balance = data.balance; balEl.textContent=fmt(balance); $('withdrawMsg').textContent='Withdraw request submitted'; $('wdAmount').value=''; $('wdWallet').value=''; closeModal('withdrawModal'); }
    else $('withdrawMsg').textContent = data.msg || 'Withdraw failed';
  } catch(e){ console.error(e); $('withdrawMsg').textContent='Withdraw failed'; }
});

/* --------------- Activity log --------------- */
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

/* --------------- Modal open/close --------------- */
document.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', e => closeModal(e.getAttribute('data-close'))));
function openModal(id){ document.getElementById(id).classList.remove('hidden'); }
function closeModal(id){ document.getElementById(id).classList.add('hidden'); }

$('openDeposit').addEventListener('click', ()=> openModal('depositModal'));
$('openWithdraw').addEventListener('click', ()=> openModal('withdrawModal'));
