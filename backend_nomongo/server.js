require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// In-memory stores (restart = reset)
const users = {};                 // { username: { username, passwordHashPlain } }
const wallets = {};               // { username: { USDT: number } }
const txs = {};                   // { username: [ {id,type,amount,ts,meta} ] }
const deposits = {};              // { id: { id, user, amountUSD, status, ts } }

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'letmein';

// helpers
const mkId = () => (Date.now().toString(36) + Math.random().toString(36).slice(2, 8));
const now = () => new Date().toISOString();
const ensureWallet = (u) => (wallets[u] ||= { USDT: 0 });
const ensureTxs = (u) => (txs[u] ||= []);
const auth = (req,res,next)=>{
  const h = req.headers.authorization || '';
  const t = h.startsWith('Bearer ') ? h.slice(7) : null;
  try { req.user = jwt.verify(t || '', JWT_SECRET); next(); }
  catch { return res.status(401).json({ error: 'unauthorized' }); }
};
const admin = (req,res,next)=>{
  if ((req.headers['x-admin-secret'] || '') !== ADMIN_SECRET) return res.status(401).json({ error:'admin unauthorized' });
  next();
};

// auth
app.post('/api/auth/register', (req,res)=>{
  const { username, password } = req.body || {};
  if(!username || !password) return res.status(400).json({ error:'missing fields' });
  if(users[username]) return res.status(400).json({ error:'user exists' });
  users[username] = { username, passwordHashPlain: password }; // simple for demo
  ensureWallet(username); ensureTxs(username);
  return res.json({ ok:true });
});

app.post('/api/auth/login', (req,res)=>{
  const { username, password } = req.body || {};
  const u = users[username];
  if(!u || u.passwordHashPlain !== password) return res.status(401).json({ error:'bad credentials' });
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn:'7d' });
  return res.json({ token });
});

// wallet & txs
app.get('/api/wallets', auth, (req,res)=>{
  ensureWallet(req.user.username);
  res.json(wallets[req.user.username]);
});

app.get('/api/transactions', auth, (req,res)=>{
  ensureTxs(req.user.username);
  res.json(txs[req.user.username]);
});

// DEPOSIT: create P2P intent -> return Binance link (Cash App, buy BTC) + depositId
app.post('/api/deposits/initiate', auth, (req,res)=>{
  const amountUSD = Number(req.body?.amountUSD || 0);
  if(!Number.isFinite(amountUSD) || amountUSD <= 0) return res.status(400).json({ error:'invalid amount' });
  const id = mkId();
  const user = req.user.username;

  // Binance P2P BUY BTC, fiat USD, filter Cash App (payer uses their own account)
  const asset = 'BTC';
  const fiat = 'USD';
  const payment = 'CASHAPP';
  const url = `https://p2p.binance.com/en/trade/buy/${asset}?fiat=${fiat}&payment=${payment}&amount=${encodeURIComponent(amountUSD)}`;

  deposits[id] = { id, user, amountUSD, status:'pending', ts: now() };

  res.json({ id, amountUSD, status:'pending', binanceUrl: url });
});

// DEPOSIT: check status (for polling in UI)
app.get('/api/deposits/:id', auth, (req,res)=>{
  const d = deposits[req.params.id];
  if(!d || d.user !== req.user.username) return res.status(404).json({ error:'not found' });
  res.json(d);
});

// ADMIN: mark deposit paid => credit USDT 1:1 (off-chain credit)
app.post('/api/admin/deposits/:id/mark-paid', admin, (req,res)=>{
  const d = deposits[req.params.id];
  if(!d) return res.status(404).json({ error:'not found' });
  if(d.status === 'paid') return res.json(d);

  d.status = 'paid';
  ensureWallet(d.user);
  wallets[d.user].USDT += d.amountUSD;  // 1 USD ≈ 1 USDT credit

  const entry = { id: mkId(), type:'DEPOSIT', amount: d.amountUSD, ts: now(), meta:{ depositId:d.id } };
  ensureTxs(d.user).unshift(entry);

  res.json({ ok:true, deposit:d, wallet: wallets[d.user] });
});

// Withdraw (off-chain request; operator sends USDT manually/TRC20 elsewhere)
app.post('/api/tx/withdraw', auth, (req,res)=>{
  const { amount, address } = req.body || {};
  const amt = Number(amount || 0);
  if(!address || !amt || amt<=0) return res.status(400).json({ error:'invalid params' });
  ensureWallet(req.user.username);
  if(wallets[req.user.username].USDT < amt) return res.status(400).json({ error:'insufficient USDT' });

  wallets[req.user.username].USDT -= amt;
  const entry = { id: mkId(), type:'WITHDRAW_REQUEST', amount: amt, ts: now(), meta:{ address } };
  ensureTxs(req.user.username).unshift(entry);
  res.json({ ok:true, wallet:wallets[req.user.username], tx: entry });
});

// health
app.get('/', (_,res)=>res.send('OK'));

const PORT = Number(process.env.PORT || 5000);
app.get('/health',(req,res)=>res.json({status:'ok'}));
app.listen(PORT, ()=> console.log(`🚀 Backend running on port ${PORT}`));
app.get('/health',(req,res)=>res.json({status:'ok'}));
app.get('/health',(req,res)=>res.json({status:'ok'}));
