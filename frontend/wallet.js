function getAuthHeaders(){return{"Content-Type":"application/json","Authorization":"Bearer "+(localStorage.getItem("token")||"")};}
async function apiPost(path, body){const r=await fetch(API_BASE+path,{method:"POST",headers:getAuthHeaders(),body:JSON.stringify(body||{})});return r.json();}
async function apiGet(path){const r=await fetch(API_BASE+path,{headers:getAuthHeaders()});return r.json();}
async function register(username,password){return apiPost("/api/auth/register",{username,password});}
async function login(username,password){const d=await apiPost("/api/auth/login",{username,password});if(d.token)localStorage.setItem("token",d.token);return d;}
async function getWallet(){return apiGet("/api/wallets");}
async function getTransactions(){return apiGet("/api/transactions");}
async function deposit(amount){return apiPost("/api/tx/deposit",{amount});}
async function withdraw(amount,address){return apiPost("/api/tx/withdraw",{amount,address});}
async function exchange(from,to,amount){return apiPost("/api/tx/exchange",{from,to,amount});}
async function createCashAppIntent(amount){return apiPost("/api/deposit/cashapp",{amount});}
async function getIntentStatus(id){return apiGet("/api/deposit/"+id+"/status");}
