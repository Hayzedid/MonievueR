// routes/bankRoutes.js
import express from 'express';
import { syncAllAccounts } from '../services/bankService.js';
import User from '../models/User.js';

const router = express.Router();

// Example mock accounts for a user
function getMockAccounts() {
  return [
    { accountId: 'wema-001', bankName: 'Wema Bank' },
    { accountId: 'gtb-002', bankName: 'GT Bank' },
    { accountId: 'opay-003', bankName: 'Opay' },
    { accountId: 'first-004', bankName: 'FirstBank' },
  ];
}

// POST /api/bank/sync/:userId
router.post('/sync/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const mockAccounts = getMockAccounts();
    const allTransactions = await syncAllAccounts(userId, mockAccounts);

    res.json({
      success: true,
      totalTransactions: allTransactions.length,
      accountsProcessed: mockAccounts.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
