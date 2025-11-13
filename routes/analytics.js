import express from 'express';
import {
  calculateFinancialMetrics,
  detectMoneyPersonality,
  calculateCreditScore,
} from '../services/analyticsService.js';
import { generateEmotionalInsight, generateCreditStory } from '../services/geminiService.js';
import { getTransactionsByUserId } from '../services/transactionService.js';
import User from '../models/User.js';
import FinancialInsight from '../models/FinancialInsight.js';

const router = express.Router();

// GET /api/analytics/insights/:userId?bank=BankName&days=90
router.get('/insights/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 90, bank } = req.query;

    // Import bank analytics service for filtering
    const { calculateFinancialMetricsByBank } = await import('../services/bankAnalyticsService.js');
    
    // Calculate metrics with optional bank filtering
    const metrics = bank ? 
      await calculateFinancialMetricsByBank(userId, parseInt(days), bank) :
      await calculateFinancialMetrics(userId, parseInt(days));

    // Detect personality
    const personality = detectMoneyPersonality(metrics);

    // Calculate credit score
    const creditScore = calculateCreditScore(metrics);

    // Get user for name
    const user = await User.findById(userId);

    // Generate emotional insight
    const emotionalInsight = await generateEmotionalInsight(personality, metrics, user?.firstName || 'Friend');

    // Generate credit story
    const creditStory = await generateCreditStory(metrics, personality);

    // Save insight to database
    const insight = new FinancialInsight({
      userId,
      period: 'monthly',
      ...metrics,
      moneyPersonality: personality,
      emotionalInsight,
      creditScore,
      creditScoreFactors: {
        savingsBehavior: metrics.savingsRatio,
        spendingConsistency: metrics.consistencyScore,
        overdraftRisk: Math.max(0, 100 - metrics.overdrafts * 20),
        incomeStability: (metrics.regularDeposits / (metrics.regularDeposits + metrics.irregularDeposits)) * 100 || 0,
      },
    });

    await insight.save();

    // Update user with personality and credit score
    await User.findByIdAndUpdate(userId, {
      moneyPersonality: personality,
      creditScore,
      lastAnalyzedAt: new Date(),
    });

    res.json({
      success: true,
      data: {
        metrics,
        personality,
        creditScore,
        emotionalInsight,
        creditStory,
        insight: insight._id,
      },
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/analytics/history/:userId
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;

    const insights = await FinancialInsight.find({ userId })
      .sort({ generatedAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: insights,
    });
  } catch (error) {
    console.error('Error fetching insight history:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/analytics/transactions/:userId
router.get('/transactions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 90 } = req.query;

    const transactions = await getTransactionsByUserId(userId, parseInt(days));

    res.json({
      success: true,
      data: {
        count: transactions.length,
        transactions,
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/analytics/spending/:userId?bank=BankName&days=90
router.get('/spending/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 90, bank } = req.query;

    // Import bank analytics service for filtering
    const { calculateFinancialMetricsByBank } = await import('../services/bankAnalyticsService.js');
    
    // Calculate metrics with optional bank filtering
    const metrics = bank ? 
      await calculateFinancialMetricsByBank(userId, parseInt(days), bank) :
      await calculateFinancialMetrics(userId, parseInt(days));

    res.json({
      success: true,
      data: {
        spendingByCategory: metrics.spendingByCategory,
        totalSpending: metrics.totalSpending,
        totalIncome: metrics.totalIncome,
      },
    });
  } catch (error) {
    console.error('Error fetching spending data:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
