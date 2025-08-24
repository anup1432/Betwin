/* ------------------ Config ------------------ */
const API_URL = "https://betwin-winn.onrender.com"; // aapka backend URL
const $ = id => document.getElementById(id);
const fmt = n => Number(n).toFixed(2);

/* ------------------ Initial UI refs ------------------ */
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

/* ------------------ Chart setup ------------------ */
const ctx = document.getElementById('priceChart').getContext('2d');
let series = [100]; // initial seed
const chart = new Chart(ctx, {
  type:'line',
  data:{ labels: series.map((_,i)=>i), datasets:[{
    data: series,
    borderColor: '#00d27a',
    backgroundColor: 'rgba(0,210,122,0.1)',
    borderWidth:2.4, pointRadius:0, tension:0.35, fill:true
  }]},
  options:{ animation:false, plugins:{legend:{display:false},tooltip:{enabled:false}}, scales:{x:{display:false}, y:{display:false}}, responsive:true, maintainAspectRatio:false }
});

/* ------------------ Backend helpers ------------------ */
async function getBalance() {
  const res = await fetch(`${API_URL}/balance`);
  const data = await res.json();
  if(data.ok) balEl.textContent = fmt(data.balance);
}
async function getRoundData() {
  const res = await fetch(`${API_URL}/round`);
  const data = await res.json();
  if(!data.ok) return;
  // Update UI
  roundEl.textContent = data.round;
  phaseEl.textContent = data.phase.toUpperCase();
  timerEl.textContent = data.timeLeft + "s";
  upTotalEl.textContent = fmt(data.totals.up);
  downTotalEl.textContent = fmt(data.totals.down);
  priceVal.textContent = "$" + fmt(data.price);
  priceArrow.textContent = data.up ? "▲" : "▼";
  renderBots(data.bots.up, data.bots.down);
}
async function placeBet(side, amount) {
  const res = await fetch(`${API_URL}/bet`, {
    method:"POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ side, amount })
  });
  const data = await res.json();
  if(data.ok){
    log(`You bet $${fmt(amount)} on ${side.toUpperCase()}`);
    getBalance();
  } else log(data.msg || "Bet failed");
}
async function submitDeposit(txn, wallet) {
  const res = await fetch(`${API_URL}/deposit`, {
    method:"POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ txn, wallet })
  });
  const data = await res.json();
  $('depositMsg').textContent = data.msg || "";
  if(data.ok) closeModal('depositModal');
}
async function submitWithdraw(amount, wallet) {
  const res = await fetch(`${API_URL}/withdraw`, {
    method:"POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ amount, wallet })
  });
  const data = await res.json();
  $('withdrawMsg').textContent = data.msg || "";
  if(data.ok) closeModal('withdrawModal');
}

/* ------------------ Bots rendering ------------------ */
function renderBots(upBots=[], downBots=[]) {
  upBotsList.innerHTML = upBots.map(b => `
    <div class="bot"><div class="avatar" style="background:#0b2">${b.avatar}</div>
    <div class="meta"><div class="name">${b.name}</div><div class="meta-sub">UP</div></div>
    <div class="amt">$${fmt(b.amount)}</div></div>`).join('');
  downBotsList.innerHTML = downBots.map(b => `
    <div class="bot"><div class="avatar" style="background:#f66">${b.avatar}</div>
    <div class="meta"><div class="name">${b.name}</div><div class="meta-sub">DOWN</div></div>
    <div class="amt">$${fmt(b.amount)}</div></div>`).join('');
}

/* ------------------ Activity log ------------------ */
function log(msg){
  const row = document.createElement('div');
  row.className='row';
  const t = new Date().toLocaleTimeString();
  row.innerHTML=`<span>${t}</span><span>${msg}</span>`;
  activity.querySelector('.hint')?.remove();
  activity.prepend(row);
  while(activity.children.length>40) activity.lastChild.remove();
}

/* ------------------ UI Events ------------------ */
$('betUp').addEventListener('click',()=> {
  const amt=parseFloat($('betAmount').value||'0'); 
  if(amt>0) placeBet('up', amt);
});
$('betDown').addEventListener('click',()=> {
  const amt=parseFloat($('betAmount').value||'0'); 
  if(amt>0) placeBet('down', amt);
});

/* Deposit modal */
$('openDeposit').addEventListener('click',()=>openModal('depositModal'));
$('openWithdraw').addEventListener('click',()=>openModal('withdrawModal'));
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click', e=>closeModal(e.currentTarget.dataset.close)));
function openModal(id){ $(id).classList.remove('hidden'); }
function closeModal(id){ $(id).classList.add('hidden'); }

/* Deposit / Withdraw submit */
$('submitDeposit').addEventListener('click',()=> {
  const txn=$('depositTxn').value.trim();
  const wallet=$('depositWalletSelect')?.value;
  if(txn && wallet) submitDeposit(txn, wallet);
});
$('submitWithdraw').addEventListener('click',()=> {
  const amt=parseFloat($('wdAmount').value||'0'); 
  const wal=$('wdWallet').value.trim();
  if(amt>=5 && wal) submitWithdraw(amt, wal);
});

/* ------------------ Init ------------------ */
async function init() {
  await getBalance();
  await getRoundData();
  setInterval(getRoundData, 1500); // refresh every 1.5s
}
init();
