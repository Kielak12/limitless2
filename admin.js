// admin.js — logowanie i lista zgłoszeń
(function(){
  const authView = document.getElementById('auth-view');
  const panelView = document.getElementById('panel-view');
  const searchInput = document.getElementById('search');
  const tbody = document.querySelector('#quotes-table tbody');
  const count = document.getElementById('count');

  async function session(){
    const r = await fetch('/api/session');
    if(!r.ok) return {authenticated:false};
    return r.json();
  }
  function showAuth(){ authView.hidden=false; panelView.hidden=true; }
  function showPanel(){ authView.hidden=true; panelView.hidden=false; }

  async function init(){
    const s = await session();
    if(s.authenticated) { showPanel(); load(); }
    else showAuth();
  }

  async function login(){
    const login = document.getElementById('login').value || '123';
    const password = document.getElementById('password').value || '123';
    const r = await fetch('/api/login', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({login, password})});
    if(r.ok){ showPanel(); load(); }
    else alert('Błędne dane logowania');
  }
  async function logout(){
    await fetch('/api/logout', {method:'POST'});
    showAuth();
  }

  async function load(){
    const r = await fetch('/api/quotes');
    if(!r.ok){ tbody.innerHTML = '<tr><td colspan=3>Błąd odczytu (czy zalogowany?)</td></tr>'; return; }
    const rows = await r.json();
    window.__rows = rows;
    render(rows);
  }
  function render(rows){
    const q = (searchInput.value||'').toLowerCase();
    const filtered = rows.filter(row=>{
      const txt = JSON.stringify(row.data).toLowerCase();
      return txt.includes(q);
    });
    count.textContent = `Zgłoszeń: ${filtered.length}`;
    tbody.innerHTML = filtered.map(r=>{
      const pretty = Object.entries(r.data).map(([k,v])=>`<span class="badge">${k}</span> ${String(v)}`).join('<br>');
      const date = new Date(r.created_at || r.ts || Date.now()).toLocaleString();
      return `<tr><td>${r.id}</td><td>${date}</td><td>${pretty}</td></tr>`;
    }).join('') || '<tr><td colspan=3>Brak zgłoszeń</td></tr>';
  }

  document.getElementById('login-btn').addEventListener('click', login);
  document.getElementById('logout-btn').addEventListener('click', logout);
  document.getElementById('refresh-btn').addEventListener('click', load);
  document.getElementById('export-btn').addEventListener('click', ()=>{
    const rows = window.__rows||[];
    const head = ['id','created_at','data'];
    const csv = [head.join(',')].concat(rows.map(r=>{
      const d = JSON.stringify(r.data).replace(/"/g,'""');
      return [r.id, r.created_at, `"${d}"`].join(',');
    })).join('\n');
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'quotes.csv'; a.click();
    URL.revokeObjectURL(url);
  });
  searchInput.addEventListener('input', ()=>render(window.__rows||[]));
  addEventListener('DOMContentLoaded', init);
})();