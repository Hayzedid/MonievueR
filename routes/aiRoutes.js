import express from 'express';
import { aiService } from '../services/aiService.js';

const router = express.Router();

// Get financial insights for a user
router.get('/insights/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const insights = await aiService.getFinancialInsights(userId);
    res.json(insights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analyze transactions
router.post('/analyze', async (req, res) => {
  try {
    const { userId, transactions } = req.body;
    if (!userId || !transactions) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const analysis = await aiService.analyzeTransactions(userId, transactions);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Detect money personality
router.post('/personality/detect', async (req, res) => {
  try {
    const { userId, transactions } = req.body;
    if (!userId || !transactions) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const personality = await aiService.detectMoneyPersonality(userId, transactions);
    res.json(personality);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
