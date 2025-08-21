const { useEffect, useRef, useState } = React;

function useInterval(cb, ms){ const r=useRef(); useEffect(()=>{ r.current=cb },[cb]); useEffect(()=>{ if(ms==null) return; const id=setInterval(()=>r.current&&r.current(),ms); return ()=>clearInterval(id) },[ms]); }

async function api(path, opts={}){
  const res = await fetch(`${window.API_BASE}${path}`, { headers: { 'Content-Type': 'application/json', ...(opts.token?{Authorization:'Bearer '+opts.token}:{}) }, method: opts.method||'GET', body: opts.body?JSON.stringify(opts.body):undefined });
  if(!res.ok) throw new Error((await res.json()).error||'API');
  return res.json();
}

function ChartBox({ points }){
  const ref=useRef(); const chart=useRef();
  useEffect(()=>{ if(!ref.current) return; if(chart.current) chart.current.destroy(); const ctx=ref.current.getContext('2d'); const labels=points.map(p=>new Date(p.t).toLocaleTimeString()); const data=points.map(p=>p.p); chart.current=new Chart(ctx,{ type:'line', data:{ labels, datasets:[{ data, tension:.25, borderWidth:2, pointRadius:0 }] }, options:{ plugins:{ legend:{ display:false } }, scales:{ x:{ ticks:{ display:false }, grid:{ display:false } }, y:{ grid:{ color:'rgba(120,120,120,.2)' } } } } }); }, [points.length]);
  return React.createElement('canvas', { ref:ref, width:900, height:360 });
}

function Login({ onAuth }){
  const [u,setU]=useState('user'+Math.floor(Math.random()*1000));
  const [p,setP]=useState('123456');
  const [err,setErr]=useState('');
  return React.createElement('div',{className:'card'},
    React.createElement('h3',null,'Login / Signup'),
    React.createElement('div',null,
      React.createElement('input',{className:'input', placeholder:'Username', value:u, onChange:e=>setU(e.target.value)}),
      React.createElement('br'),React.createElement('br'),
      React.createElement('input',{className:'input', placeholder:'Password', type:'password', value:p, onChange:e=>setP(e.target.value)}),
      React.createElement('br'),React.createElement('br'),
      React.createElement('button',{className:'btn btn-ghost', onClick:async()=>{ try{ const r=await api('/api/auth/register',{ method:'POST', body:{ username:u, password:p } }); localStorage.setItem('token', r.token); onAuth(r); }catch(e){ setErr(e.message) } }},'Signup'), ' ',
      React.createElement('button',{className:'btn', onClick:async()=>{ try{ const r=await api('/api/auth/login',{ method:'POST', body:{ username:u, password:p } }); localStorage.setItem('token', r.token); onAuth(r); }catch(e){ setErr(e.message) } }},'Login'),
      React.createElement('div',{className:'small'}, err)
    )
  );
}

function Wallet({ token }){
  const [amt,setAmt]=useState(10), [addr,setAddr]=useState(''), [tx,setTx]=useState(''), [msg,setMsg]=useState('');
  return React.createElement('div',{className:'card'},
    React.createElement('h3',null,'Wallet'),
    React.createElement('div',null,
      React.createElement('div',null,'Deposit Request'),
      React.createElement('input',{className:'input', placeholder:'Amount', type:'number', value:amt, onChange:e=>setAmt(Number(e.target.value))}),
      React.createElement('br'),React.createElement('br'),
      React.createElement('input',{className:'input', placeholder:'Tx Hash (optional)', value:tx, onChange:e=>setTx(e.target.value)}),
      React.createElement('br'),React.createElement('br'),
      React.createElement('button',{className:'btn', onClick:async()=>{ try{ await api('/api/wallet/deposit-request',{ method:'POST', token, body:{ amount:amt, txHash:tx } }); setMsg('Deposit requested'); }catch(e){ setMsg(e.message) } }},'Request Deposit'),
      React.createElement('hr'),
      React.createElement('div',null,'Withdraw Request'),
      React.createElement('input',{className:'input', placeholder:'Amount', type:'number', value:amt, onChange:e=>setAmt(Number(e.target.value))}),
      React.createElement('br'),React.createElement('br'),
      React.createElement('input',{className:'input', placeholder:'USDT Address', value:addr, onChange:e=>setAddr(e.target.value)}),
      React.createElement('br'),React.createElement('br'),
      React.createElement('button',{className:'btn btn-down', onClick:async()=>{ try{ await api('/api/wallet/withdraw-request',{ method:'POST', token, body:{ amount:amt, address:addr } }); setMsg('Withdraw requested'); }catch(e){ setMsg(e.message) } }},'Request Withdraw'),
      React.createElement('div',{className:'small'}, msg)
    )
  );
}

function App(){
  const [token,setToken]=useState(localStorage.getItem('token')||'');
  const [list,setList]=useState([]); const [sel,setSel]=useState(null); const [err,setErr]=useState('');
  const [menu,setMenu]=useState(false);

  async function load(){ try{ setList(await api('/api/battles')); if(sel){ setSel(await api('/api/battles/'+sel._id)); } } catch(e){ setErr(e.message) } }
  useInterval(load, 1000);

  function join(side){ return api(`/api/battles/${sel._id}/join`, { method:'POST', token, body:{ side } }).catch(e=>setErr(e.message)); }

  if(!token) return React.createElement(Login,{ onAuth:(r)=>{ setToken(r.token); } });

  return React.createElement('div',{className:'container'},
    React.createElement('div',{className:'header'},
      React.createElement('div',null, React.createElement('h2',null,'Market Battle'), React.createElement('div',{className:'small'},`API: ${window.API_BASE}`)),
      React.createElement('div',{className:`menu ${menu?'open':''}`},
        React.createElement('button',{className:'menu-btn', onClick:()=>setMenu(!menu)}, '⋮'),
        React.createElement('div',{className:'menu-list'},
          React.createElement('a',{href:'#', onClick:()=>{ const v=prompt('Backend URL', window.API_BASE); if(v){ localStorage.setItem('API_BASE', v); window.API_BASE=v; location.reload(); } }},'Change API'),
          React.createElement('a',{href:'admin.html'},'Admin Panel'),
          React.createElement('a',{href:window.TELEGRAM, target:'_blank'},'Contact on Telegram'),
          React.createElement('a',{href:'#', onClick:()=>{ alert('Simple demo app. Predict UP/DOWN within 60s.'); }},'About / Help')
        )
      )
    ),

    React.createElement('div',{className:'row'},
      React.createElement('div',{className:'card'},
        React.createElement('h3',null,'Battles'),
        React.createElement('table',{className:'table'},
          React.createElement('thead',null, React.createElement('tr',null,[ 'Symbol','Ends','Players','Status' ].map(h=>React.createElement('th',{key:h},h)))),
          React.createElement('tbody',null, list.map(b=>React.createElement('tr',{ key:b._id, onClick:()=>setSel(b), style:{ cursor:'pointer' } },[
            React.createElement('td',null,b.symbol),
            React.createElement('td',null,new Date(b.endAt).toLocaleTimeString()),
            React.createElement('td',null,(b.picks||[]).length),
            React.createElement('td',null,b.finished?'Finished':'Live')
          ])))
        )
      ),
      React.createElement('div',null,
        sel ? React.createElement('div',{className:'card'},
          React.createElement('div',null, React.createElement('div',{className:'small'}, `${sel.symbol} • Start ${sel.startPrice}`)),
          React.createElement(ChartBox,{ points: sel.points||[] }),
          React.createElement('div',null,
            React.createElement('span',{className:'badge'}, 'Ends: '+new Date(sel.endAt).toLocaleTimeString()), ' ',
            React.createElement('span',{className:'badge'}, 'Players: '+(sel.picks||[]).length), ' ',
            React.createElement('span',{className:'badge'}, sel.finished?'Finished':'Live')
          ),
          !sel.finished && React.createElement('div',null,
            React.createElement('button',{className:'btn btn-up', onClick:()=>join('UP')},'Join UP'), ' ',
            React.createElement('button',{className:'btn btn-down', onClick:()=>join('DOWN')},'Join DOWN')
          ),
          sel.finished && sel.result && React.createElement('div',null,
            React.createElement('h3',null, 'Result: '+sel.result.direction),
            React.createElement('div',null,'End: '+sel.result.endPrice+' | Change: '+sel.result.change.toFixed(2))
          )
        ) : React.createElement('div',{className:'card'}, 'Select a battle from the list')
      )
    ),

    React.createElement('br'),
    React.createElement(Wallet,{ token })
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
