const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const db = require('../db');

router.get('/history', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const limit = parseInt(req.query.limit) || 20;
  const page = parseInt(req.query.page || "0");
  const offset = page * limit;

  const sql = `SELECT type, amount, currency, status, created_at FROM transactions 
               WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`;

  db.all(sql, [userId, limit, offset], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ message: "Server error fetching transaction history." });
    }
    res.json(rows);
  });
});

router.get('/:id', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const transactionId = req.params.id;
  const sql = `SELECT * FROM transactions WHERE id = ? AND user_id = ?`;

  db.get(sql, [transactionId, userId], (err, row) => {
    if (err) {
      return res.status(500).json({ message: "Server error fetching transaction details." });
    }
    if (!row) {
      return res.status(404).json({ message: "Transaction not found or you do not have permission to view it." });
    }
    res.json(row);
  });
});

module.exports = router;
