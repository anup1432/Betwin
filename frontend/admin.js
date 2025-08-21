window.API_BASE = localStorage.getItem('API_BASE') || 'https://your-backend.onrender.com';
const st = { token: null };

async function call(path, opts={}){
  const res = await fetch(`${window.API_BASE}${path}`, { method: opts.method||'GET', headers: { 'Content-Type':'application/json', ...(st.token?{Authorization:'Bearer '+st.token}:{}) }, body: opts.body?JSON.stringify(opts.body):undefined });
  if(!res.ok) throw new Error((await res.json()).error||'API');
  return res.json();
}

async function login(){
  const u = document.getElementById('user').value; const p = document.getElementById('pass').value;
  try{ const r = await call('/api/auth/login',{ method:'POST', body:{ username:u, password:p } }); if(r.user.role!=='admin') throw new Error('Not admin'); st.token=r.token; document.getElementById('dash').style.display='block'; document.getElementById('msg').innerText='Logged in'; document.getElementById('api').innerText='API: '+window.API_BASE; loadQueues(); }catch(e){ document.getElementById('msg').innerText=e.message; }
}

async function createBattle(){
  const symbol = document.getElementById('sym').value; const duration=Number(document.getElementById('dur').value);
  try{ await call('/api/battles',{ method:'POST', body:{ symbol, duration } }); alert('Battle created'); }catch(e){ alert(e.message) }
}
async function bot(side){
  const id=document.getElementById('bid').value; try{ await call('/api/admin/bots/'+id,{ method:'POST', body:{ side } }); alert('Bot added'); }catch(e){ alert(e.message) }
}
async function resolve(){
  const id=document.getElementById('bid').value; try{ await call('/api/admin/resolve/'+id,{ method:'POST' }); alert('Resolving'); }catch(e){ alert(e.message) }
}

async function loadQueues(){
  try{
    const deps = await call('/api/wallet/admin/deposits');
    const wids = await call('/api/wallet/admin/withdrawals');
    const dhtml = deps.map(d=>`<div class="card" style="padding:8px;margin:8px 0">${d._id} • amt=${d.amount}
      <button class="btn" onclick=approveDep('${d._id}')>Approve</button>
      <button class="btn btn-down" onclick=rejectDep('${d._id}')>Reject</button></div>`).join('');
    const whtml = wids.map(w=>`<div class="card" style="padding:8px;margin:8px 0">${w._id} • amt=${w.amount}
      <button class="btn" onclick=approveWid('${w._id}')>Approve</button>
      <button class="btn btn-down" onclick=rejectWid('${w._id}')>Reject</button></div>`).join('');
    document.getElementById('deps').innerHTML = dhtml || 'No pending';
    document.getElementById('wids').innerHTML = whtml || 'No pending';
  }catch(e){ console.log(e); }
  setTimeout(loadQueues, 3000);
}

async function approveDep(id){ try{ await call('/api/wallet/admin/deposits/'+id+'/approve',{ method:'POST' }); }catch(e){ alert(e.message) } }
async function rejectDep(id){ try{ await call('/api/wallet/admin/deposits/'+id+'/reject',{ method:'POST' }); }catch(e){ alert(e.message) } }
async function approveWid(id){ try{ await call('/api/wallet/admin/withdrawals/'+id+'/approve',{ method:'POST' }); }catch(e){ alert(e.message) } }
async function rejectWid(id){ try{ await call('/api/wallet/admin/withdrawals/'+id+'/reject',{ method:'POST' }); }catch(e){ alert(e.message) } }
