// Timer
let timerSeconds = 5;
setInterval(() => {
  timerSeconds = timerSeconds > 0 ? timerSeconds - 1 : 5;
  document.getElementById('timer').textContent = timerSeconds + ' Sec';
}, 1000);

// Tabs
function showTab(tab) {
  document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
  if(tab==='positions') document.querySelectorAll('.tabs .tab')[0].classList.add('active');
  if(tab==='history') document.querySelectorAll('.tabs .tab')[1].classList.add('active');
  if(tab==='leaderboard') document.querySelectorAll('.tabs .tab')[2].classList.add('active');
  document.getElementById('tabContent').innerHTML =
    tab==='history' ? `<table class="history-table">
      <tr><th>Time</th><th>Type</th><th>Currency</th><th>Entry</th></tr>
      <tr><td>2025-08-16 13:02:53</td><td style="color:#ef3838;">DOWN</td><td>USDT</td><td>117,690</td></tr>
      <tr><td>2025-08-16 12:47:13</td><td style="color:#25d47e;">UP</td><td>USDT</td><td>117,699</td></tr>
    </table>`
    : tab==='positions' ? `<div style="color:#888;padding:22px;text-align:center;">No open positions.</div>`
    : `<div style="color:#e7ed42;padding:22px;text-align:center;">Top players soon!</div>`;
}

// Multiplier/Amount
function setMultiplier(m) {
  ['multi1','multi2','multiHalf'].forEach(id =>
    document.getElementById(id).classList.remove('active')
  );
  if (m == 1) document.getElementById('multi1').classList.add('active');
  if (m == 2) document.getElementById('multi2').classList.add('active');
  if (m == 0.5) document.getElementById('multiHalf').classList.add('active');
}
function setAmount(val) {
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  Array.from(document.querySelectorAll('.chip')).find(c=>c.textContent==='$'+val).classList.add('active');
}

// Bet
function bet(side) {
  alert("Bet placed: " + side.toUpperCase());
}

// Menu Drawer
function toggleMenu() { 
  alert("Menu coming soon!"); 
}

// Chart Draw
const gc = document.getElementById('graph');
if(gc && gc.getContext){
  let ctx = gc.getContext('2d');
  let W = 420, H = 100;
  gc.width = W; gc.height = H;
  let points = Array.from({length:32},()=>115000+Math.random()*1200+Math.random()*400);
  function drawDemoGraph(){
    ctx.clearRect(0,0,W,H);
    ctx.beginPath();
    ctx.strokeStyle='#25d47e';
    for(let i=0;i<points.length;i++){
      let px = (W/(points.length-1))*i;
      let py = H-(points[i]-115000)/1400*H;
      if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
    }
    ctx.lineWidth=3;
    ctx.stroke();
    ctx.fillStyle='#25d47e';
    ctx.beginPath();
    let px = W-1, py = H-(points[points.length-1]-115000)/1400*H;
    ctx.arc(px,py,5,0,2*Math.PI); ctx.fill();
  }
  drawDemoGraph();
}

// Round Tabs
function selectRound(r){
  document.getElementById('tab5s').classList.remove('active');
  document.getElementById('tab50').classList.remove('active');
  if(r === 5) document.getElementById('tab5s').classList.add('active');
  if(r === 50) document.getElementById('tab50').classList.add('active');
                                             }
