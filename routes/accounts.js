// routes/accounts.js
import express from 'express';
import Account from '../models/Account.js';

const router = express.Router();

// Get all accounts for a user
router.get('/:userId', async (req, res) => {
  try {
    const accounts = await Account.find({ userId: req.params.userId });
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new account
router.post('/', async (req, res) => {
  try {
    const account = new Account(req.body);
    await account.save();
    res.status(201).json({
      success: true,
      data: account
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Update account
router.put('/:accountId', async (req, res) => {
  try {
    const account = await Account.findOneAndUpdate(
      { accountId: req.params.accountId },
      req.body,
      { new: true }
    );
    
    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found'
      });
    }
    
    res.json({
      success: true,
      data: account
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

export default router;
