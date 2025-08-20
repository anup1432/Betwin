const { useEffect, useRef, useState } = React;

function useInterval(callback, delay) {
  const savedRef = useRef();
  useEffect(() => { savedRef.current = callback; }, [callback]);
  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedRef.current && savedRef.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

async function api(path, opts={}) {
  const res = await fetch(`${window.API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts
  });
  if (!res.ok) throw new Error((await res.json()).error || 'API error');
  return res.json();
}

function ChartBox({ points, startPrice }) {
  const ref = useRef();
  const chartRef = useRef();
  useEffect(() => {
    if (!ref.current) return;
    if (chartRef.current) chartRef.current.destroy();
    const ctx = ref.current.getContext('2d');
    const labels = points.map(p => new Date(p.t).toLocaleTimeString());
    const data = points.map(p => p.p);
    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets: [{ data, tension: .25, borderWidth: 2, pointRadius: 0 }] },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { display:false }, grid: { display:false } },
          y: { grid: { color: 'rgba(120,120,120,.2)' } }
        }
      }
    });
  }, [points.length]);
  return React.createElement('canvas', { ref, width: 900, height: 360 });
}

function App() {
  const [apiBase, setApiBase] = useState(window.API_BASE);
  const [username, setUsername] = useState(localStorage.getItem('username') || 'guest' + Math.floor(Math.random()*1000));
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [duration, setDuration] = useState(60);
  const [battleId, setBattleId] = useState(localStorage.getItem('battleId') || '');
  const [battle, setBattle] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { localStorage.setItem('username', username); }, [username]);
  useEffect(() => { localStorage.setItem('battleId', battleId); }, [battleId]);

  async function createBattle() {
    setError('');
    try {
      const res = await api('/api/battles', { method: 'POST', body: JSON.stringify({ symbol, duration })});
      setBattleId(res.id);
    } catch (e) { setError(e.message); }
  }

  async function join(side) {
    setError('');
    try {
      await api(`/api/battles/${battleId}/join`, { method: 'POST', body: JSON.stringify({ user: username, side })});
    } catch (e) { setError(e.message); }
  }

  async function refresh() {
    if (!battleId) return;
    try {
      const data = await api(`/api/battles/${battleId}`);
      setBattle(data);
    } catch (e) { setError(e.message); }
  }

  useInterval(refresh, 1000);

  function saveApiBase() {
    localStorage.setItem('API_BASE', apiBase);
    window.API_BASE = apiBase;
    alert('Saved!');
  }

  return (
    React.createElement('div', { className: 'container' },
      React.createElement('div', { className: 'card' },
        React.createElement('div', { className: 'header' },
          React.createElement('div', { className: 'title' }, 'Market Battle Demo'),
          React.createElement('div', { className: 'small' }, `API: ${apiBase}`)
        ),
        React.createElement('div', { className: 'row' },
          React.createElement('div', null,
            React.createElement('div', { className: 'label' }, 'Username'),
            React.createElement('input', { className: 'input', value: username, onChange: e=>setUsername(e.target.value) }),
            React.createElement('br'), React.createElement('br'),
            React.createElement('div', { className: 'label' }, 'Symbol'),
            React.createElement('input', { className: 'input', value: symbol, onChange: e=>setSymbol(e.target.value) }),
            React.createElement('br'), React.createElement('br'),
            React.createElement('div', { className: 'label' }, 'Duration (sec)'),
            React.createElement('input', { className: 'input', type:'number', value: duration, onChange: e=>setDuration(e.target.value) }),
            React.createElement('br'), React.createElement('br'),
            React.createElement('button', { className: 'btn btn-up', onClick: createBattle }, 'Create Battle'),
            React.createElement('div', { className: 'small' }, battleId ? `Battle ID: ${battleId}` : 'No battle yet'),
            React.createElement('br'),
            React.createElement('div', { className: 'label' }, 'Join Battle ID'),
            React.createElement('input', { className: 'input', value: battleId, onChange: e=>setBattleId(e.target.value) }),
            React.createElement('div', { className: 'chips' },
              React.createElement('button', { className: 'btn btn-up', onClick: ()=>join('UP') }, 'Join UP'),
              React.createElement('button', { className: 'btn btn-down', onClick: ()=>join('DOWN') }, 'Join DOWN')
            ),
            React.createElement('div', { className: 'small' }, error || '')
          ),
          React.createElement('div', null,
            battle ? (
              React.createElement(React.Fragment, null,
                React.createElement('div', { className: 'label' }, `${battle.symbol} • Start: ${battle.startPrice}`),
                React.createElement(ChartBox, { points: battle.points, startPrice: battle.startPrice }),
                React.createElement('div', { className: 'chips' },
                  React.createElement('div', { className: 'chip' }, `Ends: ${new Date(battle.endAt).toLocaleTimeString()}`),
                  React.createElement('div', { className: 'chip' }, `Players: ${battle.picks.length}`),
                  React.createElement('div', { className: 'chip' }, battle.finished ? 'Finished' : 'Live')
                ),
                battle.finished && battle.result && (
                  React.createElement('div', { className: 'center' },
                    React.createElement('h3', null, `Result: ${battle.result.direction}`),
                    React.createElement('div', null, `Change: ${battle.result.change.toFixed(2)}`),
                    React.createElement('div', null, `End: ${battle.result.endPrice}`),
                    React.createElement('div', null, `Winners: ${battle.result.winners.join(', ') || 'None'}`)
                  )
                )
              )
            ) : (
              React.createElement('div', { className: 'small' }, 'Create or join a battle, then data will appear here.')
            )
          )
        ),
        React.createElement('hr'),
        React.createElement('div', { className: 'small' },
          'Tip: Update API URL → ',
          React.createElement('span', { className: 'link', onClick: ()=>{
            const v = prompt('Backend URL (Render):', apiBase);
            if (v) { setApiBase(v); }
          }}, 'Change'), ' '
        ),
        React.createElement('div', { className: 'small' }, 'After changing, click ',
          React.createElement('span', { className: 'link', onClick: saveApiBase }, 'Save'),
          ' and hard-refresh.'
        )
      )
    )
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
