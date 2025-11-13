import express from 'express';
import {
  calculateHealthScore,
  predictCashflowRisk,
  generateSavingsSuggestion,
  assessSavingsGoal,
  analyzeEventSpending
} from '../services/advancedAnalyticsService.js';
import { calculateFinancialMetrics } from '../services/analyticsService.js';

const router = express.Router();

// GET /api/advanced/health-score/:userId
router.get('/health-score/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 90 } = req.query;

    const healthData = await calculateHealthScore(userId, parseInt(days));
    
    res.json({
      success: true,
      data: healthData
    });
  } catch (error) {
    console.error('Error calculating health score:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/advanced/cashflow-warning/:userId
router.get('/cashflow-warning/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 90 } = req.query;

    const cashflowData = await predictCashflowRisk(userId, parseInt(days));
    
    res.json({
      success: true,
      data: cashflowData
    });
  } catch (error) {
    console.error('Error predicting cashflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/advanced/savings-suggestion/:userId
router.get('/savings-suggestion/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 90 } = req.query;

    const savingsData = await generateSavingsSuggestion(userId, parseInt(days));
    
    res.json({
      success: true,
      data: savingsData
    });
  } catch (error) {
    console.error('Error generating savings suggestion:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/advanced/savings-goal/:userId
router.post('/savings-goal/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 90 } = req.query;
    const { targetAmount, targetDate } = req.body;

    if (!targetAmount || !targetDate) {
      return res.status(400).json({
        success: false,
        error: 'targetAmount and targetDate are required'
      });
    }

    const goalData = await assessSavingsGoal(userId, targetAmount, targetDate, parseInt(days));
    
    res.json({
      success: true,
      data: goalData
    });
  } catch (error) {
    console.error('Error assessing savings goal:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/advanced/event-spending/:userId
router.get('/event-spending/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 90 } = req.query;

    const eventData = await analyzeEventSpending(userId, parseInt(days));
    
    // Add month comparison (mock for now)
    const monthComparison = [{
      month: '2025-10',
      eventSpending: Math.round(eventData.totalEventSpending * 0.8),
      totalSpending: Math.round(eventData.totalEventSpending * 3),
      eventPercentage: 27,
      eventCount: Math.max(1, eventData.eventCount - 1)
    }];

    res.json({
      success: true,
      data: {
        ...eventData,
        monthComparison
      }
    });
  } catch (error) {
    console.error('Error analyzing event spending:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/advanced/event-trends/:userId
router.get('/event-trends/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 90 } = req.query;

    const eventData = await analyzeEventSpending(userId, parseInt(days));
    
    // Calculate trend (mock calculation)
    const currentMonthSpending = eventData.totalEventSpending;
    const previousMonthSpending = Math.round(currentMonthSpending * 0.8);
    const trendAmount = currentMonthSpending - previousMonthSpending;
    
    let trend;
    if (trendAmount > 1000) trend = 'Increasing';
    else if (trendAmount < -1000) trend = 'Decreasing';
    else trend = 'Stable';

    const monthlyTrend = [{
      month: '2025-10',
      eventSpending: previousMonthSpending,
      totalSpending: previousMonthSpending * 3,
      eventPercentage: 27,
      eventCount: Math.max(1, eventData.eventCount - 1)
    }];

    res.json({
      success: true,
      data: {
        trend,
        trendAmount,
        monthlyTrend
      }
    });
  } catch (error) {
    console.error('Error analyzing event trends:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/advanced/full-report/:userId
router.get('/full-report/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 90 } = req.query;

    // Get all analytics data
    const [healthScore, cashflow, savings, events, metrics] = await Promise.all([
      calculateHealthScore(userId, parseInt(days)),
      predictCashflowRisk(userId, parseInt(days)),
      generateSavingsSuggestion(userId, parseInt(days)),
      analyzeEventSpending(userId, parseInt(days)),
      calculateFinancialMetrics(userId, parseInt(days))
    ]);

    const fullReport = {
      healthScore,
      cashflow,
      savings,
      events,
      summary: {
        totalIncome: metrics.totalIncome,
        totalSpending: metrics.totalSpending,
        savingsRatio: metrics.savingsRatio,
        averageBalance: metrics.averageBalance,
        creditScore: Math.round(healthScore.healthScore * 0.8 + 20) // Convert health to credit score
      }
    };

    res.json({
      success: true,
      data: fullReport
    });
  } catch (error) {
    console.error('Error generating full report:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
