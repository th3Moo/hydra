const express = require("express");
const router = express.Router();

router.post("/deposit", (req, res) => { res.json({ message: "Deposit successful" }); });
router.post("/withdraw", (req, res) => { res.json({ message: "Withdrawal successful" }); });
router.post("/exchange", (req, res) => { res.json({ message: "Exchange successful" }); });

module.exports = router;
