const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());

// In-memory stores
const users = [];
const wallets = {};
const settings = {
  depositEnabled: true,
  withdrawEnabled: true,
  exchangeEnabled: true,
  supportedCurrencies: ["USD", "USDT", "BTC"]
};

// Middleware to check token
function auth(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });
  try {
    const decoded = jwt.verify(token, "supersecretkey");
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
}

// Routes
app.get("/", (req, res) => res.send("Hydra Backend (No Mongo) Running"));

// Auth Routes
app.post("/api/auth/register", async (req, res) => {
  const { email, password, cashappTag, tronWallet, defaultPaymentMethod } = req.body;
  if (users.find(u => u.email === email)) return res.status(400).json({ message: "User exists" });
  const hashed = await bcrypt.hash(password, 10);
  const user = { id: users.length + 1, email, password: hashed, cashappTag, tronWallet, defaultPaymentMethod };
  users.push(user);
  wallets[user.id] = settings.supportedCurrencies.map(cur => ({ currency: cur, balance: 0 }));
  res.json({ message: "User registered" });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ message: "Invalid email" });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid password" });
  const token = jwt.sign({ id: user.id }, "supersecretkey", { expiresIn: "1d" });
  res.json({ token });
});

// Wallets
app.get("/api/wallets", auth, (req, res) => {
  res.json(wallets[req.user.id] || []);
});

// Transactions
app.post("/api/tx/deposit", auth, (req, res) => {
  const { amount, currency } = req.body;
  const userWallets = wallets[req.user.id];
  const wallet = userWallets.find(w => w.currency === currency);
  if (wallet) wallet.balance += Number(amount);
  res.json({ message: "Deposit successful" });
});

app.post("/api/tx/withdraw", auth, (req, res) => {
  const { amount, currency } = req.body;
  const userWallets = wallets[req.user.id];
  const wallet = userWallets.find(w => w.currency === currency);
  if (wallet && wallet.balance >= amount) {
    wallet.balance -= Number(amount);
    return res.json({ message: "Withdrawal successful" });
  }
  res.status(400).json({ message: "Insufficient funds" });
});

app.post("/api/tx/exchange", auth, (req, res) => {
  const { from, to, amount } = req.body;
  const userWallets = wallets[req.user.id];
  const fromWallet = userWallets.find(w => w.currency === from);
  const toWallet = userWallets.find(w => w.currency === to);
  if (fromWallet && toWallet && fromWallet.balance >= amount) {
    fromWallet.balance -= Number(amount);
    toWallet.balance += Number(amount); // 1:1 rate for simplicity
    return res.json({ message: "Exchange successful" });
  }
  res.status(400).json({ message: "Exchange failed" });
});

// Settings
app.get("/api/settings", (req, res) => {
  res.json(settings);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
