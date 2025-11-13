const express = require('express');
const router = express.Router();
const BankToken = require('../models/BankTokens');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

// Simulate bank connection (replace with Mono/Okra API later)
router.post('/connect', async (req, res) => {
  try {
    const { userId, bankName } = req.body;

    // Simulate bank token with expiry 24h
    const token = 'mock-bank-token-' + Date.now();
    const expiresAt = new Date(Date.now() + 24*60*60*1000);

    await BankToken.create({ userId, bankName, token, expiresAt });

    // Simulate fetching accounts and transactions
    const account = await Account.create({ userId, bankName, accountNumber: '1234567890', balance: 50000 });
    await Transaction.create({ accountId: account._id, amount: 1200, type: 'debit', description: 'Lunch', merchant: 'Food Vendor' });

    res.json({ message: 'Bank connected', token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
