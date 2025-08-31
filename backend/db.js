const sqlite3 = require('sqlite3').verbose();

// Connect to an on-disk SQLite database file. This ensures data persistence.
const db = new sqlite3.Database('./hydra.db', (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected successfully to the persistent SQLite database.');
  }
});

// Ensure SQL runs in sequence.
db.serialize(() => {
  // Users table (fixed backticks)
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    cashapp_tag TEXT,
    tron_wallet TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error("Error creating 'users' table:", err.message);
  });

  // Wallets table
  db.run(`CREATE TABLE IF NOT EXISTS wallets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    currency TEXT NOT NULL,
    balance REAL DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, currency)
  )`, (err) => {
    if (err) console.error("Error creating 'wallets' table:", err.message);
  });

  // Transactions table
  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('deposit', 'withdrawal')),
    amount REAL NOT NULL,
    currency TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('pending', 'completed', 'failed')),
    payment_address TEXT,
    tx_hash TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )`, (err) => {
    if (err) console.error("Error creating 'transactions' table:", err.message);
  });
});

module.exports = db;
