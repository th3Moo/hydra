const express = require('express');
const router = express.Router();
const db = require('../db');

const verifyCashAppSignature = (req) => {
  // TODO: Implement real signature verification
  return true;
};

router.post('/cashapp', (req, res) => {
  if (!verifyCashAppSignature(req)) {
    return res.status(401).send('Unauthorized: Invalid signature.');
  }
  console.log("Received Verified CashApp Webhook:", req.body);
  const { external_transaction_id, reference_id, amount, currency, status } = req.body;

  if (status === 'COMPLETED') {
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");
      const findTxSql = `SELECT user_id, amount, currency FROM transactions WHERE id = ? AND status = 'pending'`;
      db.get(findTxSql, [reference_id], (err, tx) => {
        if (err || !tx) {
          console.error("Webhook Error: Transaction not found or already processed", reference_id);
          db.run("ROLLBACK");
          return;
        }
        const updateTxSql = `UPDATE transactions SET status = 'completed', tx_hash = ? WHERE id = ?`;
        db.run(updateTxSql, [external_transaction_id, reference_id]);
        const updateWalletSql = `UPDATE wallets SET balance = balance + ? WHERE user_id = ? AND currency = ?`;
        db.run(updateWalletSql, [tx.amount, tx.user_id, tx.currency], (err) => {
          if (err) { db.run("ROLLBACK"); return; }
          db.run("COMMIT");
          console.log(`User ${tx.user_id} credited with ${tx.amount} ${tx.currency}`);
        });
      });
    });
  }
  res.status(200).send('Webhook received and acknowledged');
});

router.post('/tron', (req, res) => {
  console.log("Received TRON Webhook:", req.body);
  const { to_address, amount_suns, tx_hash } = req.body;
  const amount_usdt = amount_suns / 1_000_000;
  // TODO: Verify tx_hash on-chain and credit wallet atomically
  res.status(200).send('Webhook received and acknowledged');
});

module.exports = router;
