const API = "https://betwin-winn.onrender.com";

const $ = id => document.getElementById(id);
const fmt = n => Number(n).toFixed(2);

// Wallet address fixed
$('walletAddr').textContent = '0xYourWalletHereABC123';

// Balance & activity
let balance = 0;
const activity = $('activity');

function log(msg){
  const row = document.createElement('div');
  row.innerHTML = `<span>${new Date().toLocaleTimeString()}</span> ${msg}`;
  activity.prepend(row);
  while(activity.children.length > 50) activity.lastChild.remove();
}
function setBalance(v){
  balance = v;
  $('balance').textContent = fmt(balance);
}

// Chart setup
const ctx = $('priceChart').getContext('2d');
let series = [100]; // starting price
const chart = new Chart(ctx, {
  type:'line',
  data:{labels:[0], datasets:[{data:[100], borderColor:'#0dff8a', backgroundColor:'rgba(0,210,122,0.1)', fill:true, tension:0.3, pointRadius:0}]},
  options:{responsive:true, plugins:{legend:{display:false}}, scales:{x:{display:false},y:{display:false}}}
});
let target = 100, start=100, segStart=performance.now(), SEG_MS=900;
function pickTarget(){ start=target; target=Math.max(10, target + (Math.random()-0.5)*1.5); segStart=performance.now(); }
setInterval(pickTarget, SEG_MS);

function frame(ts){
  const p = Math.min(1,(ts-segStart)/SEG_MS);
  const current = start + (target-start)*p;
  series.push(current);
  if(series.length>240) series.shift();
  chart.data.datasets[0].data = series;
  chart.update('none');
  $('priceVal').textContent = '$'+current.toFixed(3);
  $('priceArrow').textContent = current >= series[series.length-2] ? '▲' : '▼';
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Bots
const BOT_NAMES = ['Alpha','Beta','CryptoKing','NehaX','Rahul23','Satoshi','Luna','Mira','Vikram','Zara','Khan','Jai','Priya','Robo1','TraderZ','Nina','Sai','Rex','Kira','Leo','Tara','Ishan','Maya','Oz','Kai','Rohit','Asha'];
function randName(){ return BOT_NAMES[Math.floor(Math.random()*BOT_NAMES.length)]+Math.floor(Math.random()*90+10); }
function randAmt(){ return +(Math.random()*25+0.5).toFixed(2); }
function makeAvatarInitials(name){ return name.split(/[^A-Za-z0-9]/).map(s=>s[0]).slice(0,2).join('').toUpperCase(); }

function genBots(count,side){
  const arr=[];
  for(let i=0;i<count;i++){
    const n = randName();
    arr.push({name:n, avatar:makeAvatarInitials(n), amt:randAmt(), side});
  }
  return arr;
}

function renderBots(up,down){
  $('upBotsList').innerHTML = up.map(b=>`<div class="bot"><div class="avatar" style="background:#0b2">${b.avatar}</div><div class="meta"><div class="name">${b.name}</div><div class="meta-sub">${b.side.toUpperCase()}</div></div><div class="amt">$${fmt(b.amt)}</div></div>`).join('');
  $('downBotsList').innerHTML = down.map(b=>`<div class="bot"><div class="avatar" style="background:#f66">${b.avatar}</div><div class="meta"><div class="name">${b.name}</div><div class="meta-sub">${b.side.toUpperCase()}</div></div><div class="amt">$${fmt(b.amt)}</div></div>`).join('');
}

// Deposit / Withdraw modal
$('openDeposit').onclick = ()=>$('depositModal').classList.remove('hidden');
$('openWithdraw').onclick = ()=>$('withdrawModal').classList.remove('hidden');
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=e=>$(e.currentTarget.getAttribute('data-close')).classList.add('hidden'));

// Deposit wallets
const DEPOSIT_WALLETS = [
  {chain:'TRC20',addr:'TWZHqkbbYTnehQ2TxnH4NgNt4crGLNy8Ns'},
  {chain:'Polygon',addr:'0xE1D4b2BEC237AEDDB47da56b82b2f15812e45B44'},
  {chain:'BEP20',addr:'0xE1D4b2BEC237AEDDB47da56b82b2f15812e45B44'},
  {chain:'TON',addr:'EQAj7vKLbaWjaNbAuAKP1e1HwmdYZ2vJ2xtWU8qq3JafkfxF'}
];
const sel = $('depositWalletSelect');
DEPOSIT_WALLETS.forEach(w=>{
  const opt = document.createElement('option'); opt.value=w.addr; opt.textContent=w.chain+': '+w.addr; sel.appendChild(opt);
});
$('copyDepositWallet').onclick = ()=>navigator.clipboard.writeText(sel.value).then(()=>log('Deposit wallet copied'));

// Deposit submit
$('submitDeposit').onclick = async()=>{
  const txn = $('depositTxn').value.trim();
  if(!txn){ log('Enter transaction id'); return; }
  try{
    const res = await fetch(`${API}/deposit`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({wallet:sel.value, txn})});
    const data = await res.json();
    log(data.msg||'Deposit submitted');
    $('depositTxn').value=''; $('depositModal').classList.add('hidden');
  }catch(e){ log('Deposit failed') }
};

// Withdraw submit
$('submitWithdraw').onclick = async()=>{
  const amt=parseFloat($('wdAmount').value), wal=$('wdWallet').value.trim();
  if(!(amt>=5)){ $('withdrawMsg').textContent='Minimum $5'; return; }
  if(amt>balance){ $('withdrawMsg').textContent='Insufficient balance'; return; }
  if(!wal){ $('withdrawMsg').textContent='Enter wallet'; return; }
  try{
    const res = await fetch(`${API}/withdraw`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({wallet:wal, amt})});
    const data = await res.json();
    if(data.ok){ balance-=amt; setBalance(balance); log('Withdraw submitted'); $('wdAmount').value=''; $('wdWallet').value=''; $('withdrawModal').classList.add('hidden'); }
  }catch(e){ log('Withdraw failed') }

// Dummy bots & players loop
setInterval(()=>{
  const up = genBots(Math.floor(Math.random()*12+8),'up');
  const down = genBots(Math.floor(Math.random()*12+8),'down');
  renderBots(up,down);
  $('players').textContent = Math.floor(Math.random()*40+30);
},2000);

// Init
log('Welcome — connected to backend!');
setBalance(0);
