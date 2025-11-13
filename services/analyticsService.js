import Transaction from '../models/Transaction.js';
import User from '../models/User.js';

export const calculateFinancialMetrics = async (userId, days = 90) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const transactions = await Transaction.find({
    userId,
    date: { $gte: startDate },
  });

  const income = transactions
    .filter((t) => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  const spending = transactions
    .filter((t) => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  const savings = income - spending;
  const savingsRatio = income > 0 ? (savings / income) * 100 : 0;

  // Spending by category
  const spendingByCategory = {};
  transactions
    .filter((t) => t.type === 'debit')
    .forEach((t) => {
      spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + t.amount;
    });

  // Balance analysis
  const balances = transactions.map((t) => t.balance).filter((b) => b !== undefined);
  const averageBalance = balances.length > 0 ? balances.reduce((a, b) => a + b) / balances.length : 0;
  const minBalance = balances.length > 0 ? Math.min(...balances) : 0;
  const maxBalance = balances.length > 0 ? Math.max(...balances) : 0;

  // Overdrafts and fees
  const overdrafts = transactions.filter((t) => t.category === 'overdraft').length;
  const lateFees = transactions.filter((t) => t.category === 'fees').length;

  // Deposit consistency
  const deposits = transactions.filter((t) => t.type === 'credit' && t.category === 'salary');
  const regularDeposits = deposits.length;
  const irregularDeposits = transactions.filter((t) => t.type === 'credit' && t.category !== 'salary').length;

  // Consistency score (0-100)
  const consistencyScore = calculateConsistencyScore(deposits, days);

  return {
    totalIncome: income,
    totalSpending: spending,
    savingsAmount: savings,
    savingsRatio,
    spendingByCategory,
    averageBalance,
    minBalance,
    maxBalance,
    overdrafts,
    lateFees,
    regularDeposits,
    irregularDeposits,
    consistencyScore,
  };
};

const calculateConsistencyScore = (deposits, days) => {
  if (deposits.length === 0) return 0;

  // Calculate expected deposits based on period
  const expectedDeposits = Math.floor(days / 30); // Assuming monthly salary
  const actualDeposits = deposits.length;
  
  // Calculate timing consistency
  const depositDates = deposits.map(d => new Date(d.date).getDate());
  const avgDate = depositDates.reduce((a, b) => a + b, 0) / depositDates.length;
  const variance = depositDates.reduce((sum, date) => sum + Math.pow(date - avgDate, 2), 0) / depositDates.length;
  const timingScore = Math.max(0, 100 - variance);

  // Calculate frequency score
  const frequencyScore = Math.min(100, (actualDeposits / Math.max(1, expectedDeposits)) * 100);

  return (timingScore + frequencyScore) / 2;
};

export const detectMoneyPersonality = (metrics) => {
  const { savingsRatio, consistencyScore, overdrafts, spendingByCategory } = metrics;

  // Calculate spending patterns
  const totalSpending = Object.values(spendingByCategory).reduce((a, b) => a + b, 0);
  const entertainmentSpending = (spendingByCategory.entertainment || 0) / totalSpending * 100;
  const savingsSpending = (spendingByCategory.savings || 0) / totalSpending * 100;

  if (savingsRatio > 20 && consistencyScore > 70) {
    return 'Planner';
  } else if (entertainmentSpending > 20 || overdrafts > 2) {
    return 'Spender';
  } else if (totalSpending < metrics.totalIncome * 0.6) {
    return 'Minimalist';
  } else {
    return 'Balancer';
  }
};

export const calculateCreditScore = (metrics) => {
  const {
    savingsRatio,
    consistencyScore,
    overdrafts,
    lateFees,
    averageBalance,
    totalIncome,
  } = metrics;

  let score = 300; // Base score

  // Savings behavior (0-200 points)
  score += Math.min(200, savingsRatio * 4);

  // Consistency (0-150 points)
  score += Math.min(150, consistencyScore * 1.5);

  // Overdraft penalty (-100 points max)
  score -= Math.min(100, overdrafts * 25);

  // Late fee penalty (-50 points max)
  score -= Math.min(50, lateFees * 10);

  // Balance stability (0-100 points)
  if (totalIncome > 0) {
    const balanceRatio = averageBalance / (totalIncome / 12); // Monthly income equivalent
    score += Math.min(100, balanceRatio * 50);
  }

  // Income stability (0-100 points)
  score += Math.min(100, consistencyScore);

  return Math.min(850, Math.max(300, Math.round(score)));
};
