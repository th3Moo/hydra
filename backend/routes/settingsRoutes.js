const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    depositEnabled: true,
    withdrawEnabled: true,
    exchangeEnabled: true,
    supportedCurrencies: ["USD", "USDT", "BTC"]
  });
});

module.exports = router;
