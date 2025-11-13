import express from 'express';
import Transaction from '../models/Transaction.js';

const router = express.Router();

// GET /aggregate/balance/:userId
router.get('/aggregate/balance/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const transactions = await Transaction.find({ userId });

    const totalBalance = transactions.reduce((acc, tx) => {
      return tx.type === 'credit' ? acc + tx.amount : acc - tx.amount;
    }, 0);

    res.json({ success: true, totalBalance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

