// Auth routes (register/login)
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, password, cashapp_tag, tron_wallet } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing required fields" });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `INSERT INTO users (email, password, cashapp_tag, tron_wallet) VALUES (?, ?, ?, ?)`;
    db.run(query, [email, hashedPassword, cashapp_tag || null, tron_wallet || null], function (err) {
      if (err) return res.status(500).json({ error: "User already exists or DB error" });
      res.status(201).json({ message: "User registered", userId: this.lastID });
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing credentials" });

  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err || !user) return res.status(400).json({ error: "Invalid email or password" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid email or password" });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token });
  });
});

module.exports = router;
