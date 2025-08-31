const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const db = require('../db');

router.get('/', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const sql = "SELECT id, email, cashapp_tag, tron_wallet, created_at FROM users WHERE id = ?";
  db.get(sql, [userId], (err, row) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching profile information." });
    }
    if (!row) {
      return res.status(404).json({ message: "User profile not found." });
    }
    res.json(row);
  });
});

router.put('/', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const { cashapp_tag, tron_wallet } = req.body;
  if (typeof cashapp_tag === 'undefined' || typeof tron_wallet === 'undefined') {
    return res.status(400).json({ message: "Please provide both cashapp_tag and tron_wallet fields." });
  }
  const sql = "UPDATE users SET cashapp_tag = ?, tron_wallet = ? WHERE id = ?";
  db.run(sql, [cashapp_tag, tron_wallet, userId], function(err) {
    if (err) {
      return res.status(500).json({ message: "Error updating profile details." });
    }
    res.json({ message: "Profile updated successfully." });
  });
});

module.exports = router;
