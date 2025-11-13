import { calculateFinancialMetrics } from './analyticsService.js';
import Transaction from '../models/Transaction.js';

// Financial Health Score Calculator (0-100)
export const calculateHealthScore = async (userId, days = 90) => {
  const metrics = await calculateFinancialMetrics(userId, days);
  
  let score = 0;
  
  // Savings Ratio (40 points max)
  if (metrics.savingsRatio >= 20) score += 40;
  else if (metrics.savingsRatio >= 15) score += 30;
  else if (metrics.savingsRatio >= 10) score += 20;
  else if (metrics.savingsRatio >= 5) score += 10;
  
  // Consistency Score (25 points max)
  score += Math.min(25, metrics.consistencyScore * 0.25);
  
  // Overdraft Penalty (-20 points max)
  score -= Math.min(20, metrics.overdrafts * 5);
  
  // Late Fee Penalty (-10 points max)
  score -= Math.min(10, metrics.lateFees * 2);
  
  // Balance Stability (25 points max)
  if (metrics.averageBalance > metrics.totalIncome * 0.5) score += 25;
  else if (metrics.averageBalance > metrics.totalIncome * 0.3) score += 20;
  else if (metrics.averageBalance > metrics.totalIncome * 0.1) score += 15;
  else if (metrics.averageBalance > 0) score += 10;
  
  // Income Regularity (10 points max)
  if (metrics.regularDeposits >= 3) score += 10;
  else if (metrics.regularDeposits >= 2) score += 7;
  else if (metrics.regularDeposits >= 1) score += 5;
  
  const finalScore = Math.max(0, Math.min(100, Math.round(score)));
  
  let scoreLevel;
  if (finalScore >= 80) scoreLevel = 'Excellent';
  else if (finalScore >= 60) scoreLevel = 'Good';
  else if (finalScore >= 40) scoreLevel = 'Fair';
  else scoreLevel = 'Needs Work';
  
  // Generate actionable insights
  const insights = generateHealthInsights(metrics, finalScore);
  
  return {
    healthScore: finalScore,
    scoreLevel,
    insights,
    metrics: {
      savingsRatio: metrics.savingsRatio,
      consistencyScore: metrics.consistencyScore,
      averageBalance: metrics.averageBalance,
      overdrafts: metrics.overdrafts,
      lateFees: metrics.lateFees
    }
  };
};

// Generate Health Improvement Insights
const generateHealthInsights = (metrics, score) => {
  const insights = [];
  
  if (metrics.savingsRatio < 20) {
    insights.push(`Try to save at least 20% of your income. You're currently saving ${metrics.savingsRatio.toFixed(1)}%.`);
  }
  
  if (metrics.overdrafts > 0) {
    insights.push(`Avoid overdrafts by setting up balance alerts. You had ${metrics.overdrafts} overdrafts recently.`);
  }
  
  if (metrics.consistencyScore < 70) {
    insights.push('Build more consistent income patterns for better financial stability.');
  }
  
  if (insights.length === 0) {
    insights.push('Great job! Keep maintaining your excellent financial habits.');
  }
  
  return insights.slice(0, 3); // Return top 3 insights
};

// Predictive Cashflow Warning
export const predictCashflowRisk = async (userId, days = 90) => {
  const metrics = await calculateFinancialMetrics(userId, days);
  const monthlyIncome = metrics.totalIncome / (days / 30);
  const monthlySpending = metrics.totalSpending / (days / 30);
  
  // Predict balance in 7 days
  const weeklySpending = monthlySpending / 4;
  const predictedBalance = metrics.averageBalance - weeklySpending;
  
  // Calculate risk level
  let riskLevel;
  if (predictedBalance > monthlyIncome * 0.15) riskLevel = 'Low';
  else if (predictedBalance > monthlyIncome * 0.10) riskLevel = 'Medium';
  else riskLevel = 'High';
  
  // Calculate days until low balance
  let daysUntilLowBalance = null;
  if (predictedBalance < monthlyIncome * 0.10) {
    daysUntilLowBalance = Math.max(1, Math.floor((metrics.averageBalance - monthlyIncome * 0.10) / (monthlySpending / 30)));
  }
  
  // Generate upcoming bills (mock for now)
  const upcomingBills = generateUpcomingBills(metrics);
  
  // Generate warning message
  let warning = null;
  if (riskLevel === 'High') {
    warning = `⚠️ Your balance might run low in ${daysUntilLowBalance || 7} days. Consider reducing spending or increasing income.`;
  } else if (riskLevel === 'Medium') {
    warning = `💡 Your balance is getting low. Keep an eye on your spending this week.`;
  }
  
  return {
    riskLevel,
    predictedBalance: Math.round(predictedBalance),
    daysUntilLowBalance,
    upcomingBills,
    warning
  };
};

// Generate Upcoming Bills (Mock)
const generateUpcomingBills = (metrics) => {
  const bills = [];
  
  // Look for utility patterns
  if (metrics.spendingByCategory.utilities > 0) {
    bills.push({
      merchant: 'Power Company',
      amount: Math.round(metrics.spendingByCategory.utilities / 3),
      nextDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  
  return bills;
};

// Dynamic Savings Suggestion
export const generateSavingsSuggestion = async (userId, days = 90) => {
  const metrics = await calculateFinancialMetrics(userId, days);
  const monthlyIncome = metrics.totalIncome / (days / 30);
  const monthlySpending = metrics.totalSpending / (days / 30);
  
  // Identify fixed expenses (utilities, rent-like patterns)
  const fixedExpenses = {};
  if (metrics.spendingByCategory.utilities > 0) {
    fixedExpenses['Power Company'] = Math.round(metrics.spendingByCategory.utilities / (days / 30));
  }
  
  const totalFixedExpenses = Object.values(fixedExpenses).reduce((sum, amount) => sum + amount, 0);
  const availableAfterFixed = monthlyIncome - totalFixedExpenses;
  
  // Calculate safe savings (50% of available after fixed expenses)
  const monthlySavings = Math.round(availableAfterFixed * 0.5);
  const weeklySavings = Math.round(monthlySavings / 4);
  const dailySavings = Math.round(monthlySavings / 30);
  
  const remainingForFlexible = availableAfterFixed - monthlySavings;
  
  // Generate motivational message
  const suggestion = generateSavingsMotivation(monthlySavings, metrics.savingsRatio);
  
  return {
    dailySavings,
    weeklySavings,
    monthlySavings,
    suggestion,
    breakdown: {
      fixedExpenses,
      savingsTarget: monthlySavings,
      remainingForFlexible: Math.round(remainingForFlexible)
    }
  };
};

// Generate Savings Motivation
const generateSavingsMotivation = (amount, currentRatio) => {
  const messages = [
    `Save ₦${amount.toLocaleString()} monthly and watch your money grow! Small steps, big results.`,
    `Your target: ₦${amount.toLocaleString()} per month. You're currently saving ${currentRatio.toFixed(1)}% - let's improve!`,
    `Consistency is key! ₦${amount.toLocaleString()} monthly savings will secure your future.`,
    `Challenge yourself: Save ₦${amount.toLocaleString()} monthly. Your future self will thank you!`
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
};

// Savings Goal Assessment
export const assessSavingsGoal = async (userId, targetAmount, targetDate, days = 90) => {
  const metrics = await calculateFinancialMetrics(userId, days);
  const monthlyIncome = metrics.totalIncome / (days / 30);
  const monthlySpending = metrics.totalSpending / (days / 30);
  const availableForSavings = monthlyIncome - monthlySpending;
  
  const target = new Date(targetDate);
  const now = new Date();
  const daysRemaining = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  
  const dailyRequired = targetAmount / daysRemaining;
  const weeklyRequired = dailyRequired * 7;
  const monthlyRequired = dailyRequired * 30;
  
  const isAchievable = monthlyRequired <= availableForSavings * 0.8; // 80% of available savings
  
  // Generate motivation message
  const motivation = generateGoalMotivation(targetAmount, daysRemaining, isAchievable);
  
  return {
    targetAmount,
    targetDate: target.toISOString().split('T')[0],
    daysRemaining,
    dailyRequired: Math.round(dailyRequired),
    weeklyRequired: Math.round(weeklyRequired),
    isAchievable,
    motivation
  };
};

// Generate Goal Motivation
const generateGoalMotivation = (amount, days, achievable) => {
  if (achievable) {
    return `🎉 Your ₦${amount.toLocaleString()} goal is achievable in ${days} days! Stay focused and consistent.`;
  } else {
    return `💡 Your ₦${amount.toLocaleString()} goal in ${days} days is ambitious. Consider extending the timeline or reducing expenses.`;
  }
};

// Event Spending Analysis (Owambe Tracker)
export const analyzeEventSpending = async (userId, days = 90) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const transactions = await Transaction.find({
    userId,
    date: { $gte: startDate },
    type: 'debit'
  }).sort({ date: -1 });
  
  // Event keywords for Nigerian context
  const eventKeywords = [
    'party', 'wedding', 'owambe', 'venue', 'catering', 'dj', 'nightclub',
    'celebration', 'event', 'hall', 'reception', 'ceremony', 'festive'
  ];
  
  // Identify event transactions
  const eventTransactions = transactions.filter(tx => 
    eventKeywords.some(keyword => 
      tx.description?.toLowerCase().includes(keyword) ||
      tx.merchant?.toLowerCase().includes(keyword) ||
      tx.category === 'entertainment'
    )
  );
  
  // Group by date (same day events)
  const eventSpending = [];
  const groupedByDate = {};
  
  eventTransactions.forEach(tx => {
    const dateKey = tx.date.toISOString().split('T')[0];
    if (!groupedByDate[dateKey]) {
      groupedByDate[dateKey] = {
        date: tx.date.toISOString(),
        amount: 0,
        transactionCount: 0,
        merchants: []
      };
    }
    groupedByDate[dateKey].amount += tx.amount;
    groupedByDate[dateKey].transactionCount++;
    if (!groupedByDate[dateKey].merchants.includes(tx.merchant)) {
      groupedByDate[dateKey].merchants.push(tx.merchant);
    }
  });
  
  Object.values(groupedByDate).forEach(event => {
    if (event.amount > 5000) { // Minimum threshold for events
      eventSpending.push(event);
    }
  });
  
  const totalEventSpending = eventSpending.reduce((sum, event) => sum + event.amount, 0);
  const eventCount = eventSpending.length;
  
  // Generate humorous insight
  const insight = generateEventInsight(totalEventSpending, eventCount, days);
  
  return {
    eventSpending,
    totalEventSpending,
    eventCount,
    insight
  };
};

// Generate Event Spending Insight
const generateEventInsight = (total, count, days) => {
  if (count === 0) {
    return "🏠 You've been staying home lately! Your wallet appreciates the break from owambes.";
  }
  
  const average = total / count;
  const insights = [
    `🎉 You attended ${count} events and spent ₦${total.toLocaleString()}. That's ₦${average.toLocaleString()} per owambe!`,
    `💃 ${count} parties in ${days} days? You're definitely the life of the party! Total damage: ₦${total.toLocaleString()}.`,
    `🕺 Your social calendar is busy! ₦${total.toLocaleString()} on ${count} events. Remember to budget for fun!`,
    `🎊 Party animal alert! ₦${total.toLocaleString()} on celebrations. Your friends must love having you around!`
  ];
  
  return insights[Math.floor(Math.random() * insights.length)];
};
