const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const { TronWeb } = require('tronweb');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "hydra-secret";

// 🚀 Tron config (TRC20 USDT)
const tronWeb = new TronWeb({
  fullHost: "https://api.trongrid.io",
  privateKey: process.env.TRON_PRIVATE_KEY || ""
});
const USDT_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"; // Mainnet USDT

// In-memory stores
let users = {};         // { username: password }
let wallets = {};       // { username: { USD, USDT } }
let transactions = {};  // { username: [ ... ] }

// Middleware
function auth(req,res,next){
  const token = req.headers.authorization?.split(" ")[1];
  if(!token) return res.status(401).json({error:"No token"});
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch(e){ return res.status(401).json({error:"Invalid token"}); }
}

// Register
app.post("/api/auth/register",(req,res)=>{
  const {username,password} = req.body;
  if(users[username]) return res.status(400).json({error:"User exists"});
  users[username]=password;
  wallets[username]={USD:0,USDT:0};
  transactions[username]=[];
  res.json({success:true});
});

// Login
app.post("/api/auth/login",(req,res)=>{
  const {username,password}=req.body;
  if(users[username]!==password) return res.status(400).json({error:"Invalid creds"});
  const token=jwt.sign({username},JWT_SECRET,{expiresIn:"2h"});
  res.json({token});
});

// Get wallet
app.get("/api/wallets",auth,(req,res)=>{
  res.json(wallets[req.user.username]||{USD:0,USDT:0});
});

// Get transactions
app.get("/api/transactions",auth,(req,res)=>{
  res.json(transactions[req.user.username]||[]);
});

// Deposit (USD)
app.post("/api/tx/deposit",auth,(req,res)=>{
  const {amount}=req.body;
  if(!amount||amount<=0) return res.status(400).json({error:"Invalid amount"});
  wallets[req.user.username].USD += amount;
  const tx={type:"deposit",amount,currency:"USD",time:new Date()};
  transactions[req.user.username].push(tx);
  res.json(tx);
});

// Withdraw (USDT TRC20)
app.post("/api/tx/withdraw",auth,async(req,res)=>{
  const {amount,address}=req.body;
  if(!amount||amount<=0) return res.status(400).json({error:"Invalid amount"});
  if(wallets[req.user.username].USDT<amount) return res.status(400).json({error:"Not enough USDT"});
  try {
    const contract = await tronWeb.contract().at(USDT_CONTRACT);
    const txHash = await contract.transfer(address, amount * 1e6).send(); // 6 decimals
    wallets[req.user.username].USDT -= amount;
    const tx={type:"withdraw",amount,currency:"USDT",address,txHash,time:new Date()};
    transactions[req.user.username].push(tx);
    res.json(tx);
  } catch(e){
    console.error(e);
    res.status(500).json({error:"TRC20 withdraw failed"});
  }
});

// Exchange USD → USDT (1:1 for demo)
app.post("/api/tx/exchange",auth,(req,res)=>{
  const {from,to,amount}=req.body;
  if(!amount||amount<=0) return res.status(400).json({error:"Invalid amount"});
  if(wallets[req.user.username][from]<amount) return res.status(400).json({error:"Not enough "+from});
  wallets[req.user.username][from]-=amount;
  wallets[req.user.username][to]+=amount;
  const tx={type:"exchange",from,to,amount,time:new Date()};
  transactions[req.user.username].push(tx);
  res.json(tx);
});

app.listen(PORT,()=>console.log(`🚀 Backend running on port ${PORT}`));

// --- CashApp (Binance P2P) Bridge ---
const cashIntents = {}; let cashSeq=1;
app.post('/api/deposit/cashapp',(req,res)=>{const u=(req.user&&req.user.username)||'guest';const amount=Number(req.body&&req.body.amount)||0;if(amount<5)return res.status(400).json({error:'min '});const id=(cashSeq++).toString();cashIntents[id]={id,user:u,amount,status:'PENDING',created:Date.now()};return res.json(cashIntents[id]);});
app.get('/api/deposit/:id/status',(req,res)=>{const it=cashIntents[req.params.id];if(!it)return res.status(404).json({error:'not found'});res.json(it);});
app.post('/api/admin/deposit/:id/mark-paid',(req,res)=>{const it=cashIntents[req.params.id];if(!it)return res.status(404).json({error:'not found'});it.status='PAID';const w=wallets[it.user]||(wallets[it.user]={USD:0,USDT:0,TRX:0,TRC20_USDT:0});w.USDT+=it.amount;res.json({ok:true,creditedUSDT:w.USDT});});

