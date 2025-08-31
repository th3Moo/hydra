const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const db = require('../db');

router.get('/balances', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const sql = "SELECT currency, balance FROM wallets WHERE user_id = ?";
  db.all(sql, [userId], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ message: "Server error fetching wallet balances." });
    }
    res.json(rows);
  });
});

router.post('/deposit', authMiddleware, (req, res) => {
  const { amount, currency, method } = req.body;
  const userId = req.user.id;

  if (!amount || !currency || !method || amount <= 0) {
    return res.status(400).json({ message: "Invalid deposit request. Please provide amount, currency, and method." });
  }

  const paymentAddress = (method === 'TRON') 
    ? `GENERATE_UNIQUE_TRON_ADDRESS_FOR_USER_${userId}` 
    : `YOUR_CASHAPP_TAG_OR_LINK_WITH_ID_${Date.now()}`;

  const sql = `INSERT INTO transactions (user_id, type, amount, currency, status, payment_address) 
               VALUES (?, 'deposit', ?, ?, 'pending', ?)`;

  db.run(sql, [userId, amount, currency, paymentAddress], function(err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ message: "Failed to create deposit transaction." });
    }
    res.status(201).json({ 
      message: "Deposit initiated. Please send funds to the provided address.",
      transactionId: this.lastID,
      paymentAddress: paymentAddress
    });
  });
});

router.post('/withdraw', authMiddleware, (req, res) => {
  const { amount, currency, address } = req.body;
  const userId = req.user.id;

  if (!amount || !currency || !address || amount <= 0) {
    return res.status(400).json({ message: "Invalid withdrawal request. Amount, currency, and address are required." });
  }

  const checkBalanceSql = "SELECT balance FROM wallets WHERE user_id = ? AND currency = ?";
  db.get(checkBalanceSql, [userId, currency], (err, wallet) => {
    if (err) return res.status(500).json({ message: "Server error while checking user balance." });
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ message: "Insufficient funds for this withdrawal." });
    }

    db.serialize(() => {
      db.run("BEGIN TRANSACTION");
      const updateWalletSql = "UPDATE wallets SET balance = balance - ? WHERE user_id = ? AND currency = ?";
      db.run(updateWalletSql, [amount, userId, currency]);
      const insertTxSql = `INSERT INTO transactions (user_id, type, amount, currency, status, payment_address)
                           VALUES (?, 'withdrawal', ?, ?, 'pending', ?)`;
      db.run(insertTxSql, [userId, amount, currency, address], function(err) {
        if(err) {
          db.run("ROLLBACK");
          return res.status(500).json({ message: "Failed to create withdrawal transaction." });
        }
        db.run("COMMIT");
        res.status(201).json({ message: "Withdrawal request submitted. It will be processed shortly." });
      });
    });
  });
});

module.exports = router;
