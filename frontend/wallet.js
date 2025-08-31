function getAuthHeaders() { return { "Content-Type": "application/json", "Authorization": "Bearer " + localStorage.getItem("token") }; }
async function register(username, password) { const r = await fetch(`${API_BASE}/api/auth/register`, { method:"POST", headers:{ "Content-Type":"application/json"}, body:JSON.stringify({username,password}) }); return r.json(); }
async function login(username, password) { const r = await fetch(`${API_BASE}/api/auth/login`, { method:"POST", headers:{ "Content-Type":"application/json"}, body:JSON.stringify({username,password}) }); const d = await r.json(); if(r.ok){localStorage.setItem("token",d.token);} return d; }
async function getWallet(){ const r=await fetch(`${API_BASE}/api/wallets`,{method:"GET",headers:getAuthHeaders()}); return r.json(); }
async function getTransactions(){ const r=await fetch(`${API_BASE}/api/transactions`,{method:"GET",headers:getAuthHeaders()}); return r.json(); }
async function deposit(amount){ const r=await fetch(`${API_BASE}/api/tx/deposit`,{method:"POST",headers:getAuthHeaders(),body:JSON.stringify({amount})}); return r.json(); }
async function withdraw(amount,address){ const r=await fetch(`${API_BASE}/api/tx/withdraw`,{method:"POST",headers:getAuthHeaders(),body:JSON.stringify({amount,address})}); return r.json(); }
async function exchange(from,to,amount){ const r=await fetch(`${API_BASE}/api/tx/exchange`,{method:"POST",headers:getAuthHeaders(),body:JSON.stringify({from,to,amount})}); return r.json(); }
