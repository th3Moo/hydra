const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json([{ currency: "USD", balance: 100 }, { currency: "USDT", balance: 50 }]);
});

module.exports = router;
