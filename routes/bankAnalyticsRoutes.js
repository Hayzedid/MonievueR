import express from 'express';
import {
  calculateFinancialMetricsByBank,
  getBankComparison,
  getAccountAnalytics,
  getBankPerformanceRanking,
  getSpendingPatternsByBank
} from '../services/bankAnalyticsService.js';

const router = express.Router();

// GET /api/bank-analytics/insights/:userId?bank=BankName&account=AccountId&days=90
router.get('/insights/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { bank, account, days = 90 } = req.query;

    const metrics = await calculateFinancialMetricsByBank(
      userId, 
      parseInt(days), 
      bank, 
      account
    );

    res.json({
      success: true,
      data: {
        metrics,
        filters: {
          bank: bank || null,
          account: account || null,
          days: parseInt(days)
        }
      }
    });

  } catch (error) {
    console.error('Error getting bank insights:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/bank-analytics/comparison/:userId
router.get('/comparison/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 90 } = req.query;

    const comparison = await getBankComparison(userId, parseInt(days));

    res.json({
      success: true,
      data: comparison
    });

  } catch (error) {
    console.error('Error getting bank comparison:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/bank-analytics/accounts/:userId
router.get('/accounts/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 90 } = req.query;

    const accountAnalytics = await getAccountAnalytics(userId, parseInt(days));

    res.json({
      success: true,
      data: accountAnalytics
    });

  } catch (error) {
    console.error('Error getting account analytics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/bank-analytics/performance/:userId
router.get('/performance/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 90 } = req.query;

    const performance = await getBankPerformanceRanking(userId, parseInt(days));

    res.json({
      success: true,
      data: performance
    });

  } catch (error) {
    console.error('Error getting bank performance:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/bank-analytics/spending-patterns/:userId
router.get('/spending-patterns/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 90 } = req.query;

    const patterns = await getSpendingPatternsByBank(userId, parseInt(days));

    res.json({
      success: true,
      data: patterns
    });

  } catch (error) {
    console.error('Error getting spending patterns:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/bank-analytics/banks/:userId (Get list of user's banks)
router.get('/banks/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const Account = (await import('../models/Account.js')).default;
    const accounts = await Account.find({ userId }).distinct('bankName');

    res.json({
      success: true,
      data: {
        banks: accounts,
        count: accounts.length
      }
    });

  } catch (error) {
    console.error('Error getting user banks:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
