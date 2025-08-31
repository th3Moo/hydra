/* expects window.API_BASE from frontend/config.js */
function h(){return { "Content-Type":"application/json", "Authorization":"Bearer "+(localStorage.getItem("token")||"") };}

// AUTH
async function register(u,p){const r=await fetch(`${API_BASE}/api/auth/register`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:u,password:p})});return r.json();}
async function login(u,p){const r=await fetch(`${API_BASE}/api/auth/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:u,password:p})});const d=await r.json(); if(r.ok && d.token){localStorage.setItem("token",d.token);} return d;}

// WALLET & TX
async function getWallet(){ const r=await fetch(`${API_BASE}/api/wallets`,{headers:h()}); return r.json(); }
async function getTransactions(){ const r=await fetch(`${API_BASE}/api/transactions`,{headers:h()}); return r.json(); }

// DEPOSIT FLOW (Binance P2P -> Cash App)
async function deposit(amountUSD){
  amountUSD = Number(amountUSD||0);
  if(!amountUSD || amountUSD<=0){ alert("Enter a valid amount"); return; }
  const r = await fetch(`${API_BASE}/api/deposits/initiate`,{ method:"POST", headers:h(), body:JSON.stringify({ amountUSD })});
  const d = await r.json();
  if(!r.ok){ alert("❌ "+(d.error||"deposit error")); return; }
  // open Binance P2P
  if(d.binanceUrl) window.open(d.binanceUrl, "_blank");
  alert(`Deposit created.\nID: ${d.id}\nAfter you complete the P2P Cash App payment on Binance, ask support to approve it.\n(They will mark ID as paid)`);
  return d;
}

// OPTIONAL: poll status in UI (call from a button if you have an input for depositId)
async function checkDeposit(id){
  const r=await fetch(`${API_BASE}/api/deposits/${encodeURIComponent(id)}`,{headers:h()});
  const d=await r.json();
  if(!r.ok){ alert("❌ "+(d.error||"not found")); return; }
  alert(`Deposit ${d.id} status: ${d.status}`);
  return d;
}

// WITHDRAW
async function withdraw(amount,address){
  const r=await fetch(`${API_BASE}/api/tx/withdraw`,{method:"POST",headers:h(),body:JSON.stringify({amount:Number(amount),address})});
  const d=await r.json(); if(!r.ok){ alert("❌ "+(d.error||"withdraw error")); return; }
  alert("✅ Withdraw request submitted");
  return d;
}

// simple auto refresh if elements exist
async function refreshWalletUI(){
  try{
    const w = await getWallet();
    const t = await getTransactions();
    const bEl = document.getElementById("balance"); if(bEl) bEl.textContent = (w.USDT||0).toFixed(2)+" USDT";
    const txEl = document.getElementById("transactions");
    if(txEl){ txEl.textContent = JSON.stringify(t,null,2); }
  }catch(e){}
}
window.wallet = { register, login, getWallet, getTransactions, deposit, checkDeposit, withdraw, refreshWalletUI };
