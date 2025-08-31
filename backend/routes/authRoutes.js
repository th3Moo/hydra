const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

function findUserByEmail(email, callback) {
  db.get('SELECT * FROM users WHERE email = ?', [email], callback);
}

router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password || password.length < 6) {
    return res.status(400).json({ message: 'Email and a password of at least 6 characters are required.' });
  }

  findUserByEmail(email, async (err, user) => {
    if (err) return res.status(500).json({ message: 'Database error during user check.' });
    if (user) return res.status(400).json({ message: 'User with this email already exists.' });

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const sql = 'INSERT INTO users (email, password) VALUES (?, ?)';
      db.run(sql, [email, hashedPassword], function(err) {
        if (err) return res.status(500).json({ message: 'User registration failed at database level.' });
        const userId = this.lastID;
        db.parallelize(() => {
          db.run('INSERT INTO wallets (user_id, currency, balance) VALUES (?, ?, ?)', [userId, 'USD', 0]);
          db.run('INSERT INTO wallets (user_id, currency, balance) VALUES (?, ?, ?)', [userId, 'USDT', 0]);
        });
        const token = jwt.sign({ id: userId, email: email }, process.env.JWT_SECRET, { expiresIn: '8h' });
        res.status(201).json({ token, user: { id: userId, email } });
      });
    } catch (error) {
      res.status(500).json({ message: 'An unexpected server error occurred during registration.' });
    }
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  findUserByEmail(email, async (err, user) => {
    if (err) return res.status(500).json({ message: 'Server error during login process.' });
    if (!user) return res.status(400).json({ message: 'Invalid credentials. Please check email and password.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials. Please check email and password.' });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        cashapp_tag: user.cashapp_tag,
        tron_wallet: user.tron_wallet
      }
    });
  });
});

module.exports = router;
