import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';
import User from '../models/User.js';

// Enhanced Financial Metrics with Bank Filtering
export const calculateFinancialMetricsByBank = async (userId, days = 90, bankFilter = null, accountFilter = null) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Build query for transactions
  let transactionQuery = {
    userId,
    date: { $gte: startDate }
  };

  // If bank filter is specified, get accounts for that bank first
  if (bankFilter || accountFilter) {
    let accountQuery = { userId };
    
    if (bankFilter) {
      accountQuery.bankName = { $regex: bankFilter, $options: 'i' };
    }
    
    if (accountFilter) {
      accountQuery.accountId = accountFilter;
    }

    const accounts = await Account.find(accountQuery);
    const accountIds = accounts.map(acc => acc.accountId);
    
    if (accountIds.length === 0) {
      // No accounts found for this bank/account filter
      return getEmptyMetrics();
    }
    
    transactionQuery.accountId = { $in: accountIds };
  }

  const transactions = await Transaction.find(transactionQuery);

  if (transactions.length === 0) {
    return getEmptyMetrics();
  }

  // Calculate metrics (same logic as original)
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

  // Consistency score
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
    transactionCount: transactions.length,
    bankFilter,
    accountFilter
  };
};

// Get Bank Comparison Analytics
export const getBankComparison = async (userId, days = 90) => {
  // Get all user accounts grouped by bank
  const accounts = await Account.find({ userId });
  const bankGroups = {};
  
  accounts.forEach(account => {
    if (!bankGroups[account.bankName]) {
      bankGroups[account.bankName] = [];
    }
    bankGroups[account.bankName].push(account);
  });

  const bankComparisons = [];

  // Calculate metrics for each bank
  for (const [bankName, bankAccounts] of Object.entries(bankGroups)) {
    const metrics = await calculateFinancialMetricsByBank(userId, days, bankName);
    
    bankComparisons.push({
      bankName,
      accountCount: bankAccounts.length,
      accounts: bankAccounts.map(acc => ({
        accountId: acc.accountId,
        accountName: acc.accountName,
        accountType: acc.accountType,
        balance: acc.balance
      })),
      metrics
    });
  }

  // Sort by total spending (most active banks first)
  bankComparisons.sort((a, b) => b.metrics.totalSpending - a.metrics.totalSpending);

  return {
    banks: bankComparisons,
    summary: {
      totalBanks: bankComparisons.length,
      totalAccounts: accounts.length,
      mostActiveBank: bankComparisons[0]?.bankName || null,
      totalBalance: accounts.reduce((sum, acc) => sum + acc.balance, 0)
    }
  };
};

// Get Account-Level Analytics
export const getAccountAnalytics = async (userId, days = 90) => {
  const accounts = await Account.find({ userId });
  const accountAnalytics = [];

  for (const account of accounts) {
    const metrics = await calculateFinancialMetricsByBank(userId, days, null, account.accountId);
    
    accountAnalytics.push({
      accountId: account.accountId,
      accountName: account.accountName,
      bankName: account.bankName,
      accountType: account.accountType,
      currentBalance: account.balance,
      metrics
    });
  }

  // Sort by transaction activity
  accountAnalytics.sort((a, b) => b.metrics.transactionCount - a.metrics.transactionCount);

  return {
    accounts: accountAnalytics,
    summary: {
      totalAccounts: accountAnalytics.length,
      mostActiveAccount: accountAnalytics[0]?.accountName || null,
      totalTransactions: accountAnalytics.reduce((sum, acc) => sum + acc.metrics.transactionCount, 0)
    }
  };
};

// Get Bank Performance Ranking
export const getBankPerformanceRanking = async (userId, days = 90) => {
  const bankComparison = await getBankComparison(userId, days);
  
  const rankings = bankComparison.banks.map(bank => {
    const metrics = bank.metrics;
    
    // Calculate performance score (0-100)
    let score = 0;
    
    // Savings ratio (40 points)
    score += Math.min(40, metrics.savingsRatio);
    
    // Transaction activity (20 points)
    score += Math.min(20, metrics.transactionCount / 10);
    
    // Balance stability (20 points)
    if (metrics.averageBalance > 0) {
      const balanceStability = (metrics.minBalance / metrics.averageBalance) * 20;
      score += Math.min(20, balanceStability);
    }
    
    // Low fees (20 points)
    score += Math.max(0, 20 - metrics.lateFees * 2);
    
    return {
      bankName: bank.bankName,
      performanceScore: Math.round(score),
      metrics: {
        savingsRatio: metrics.savingsRatio,
        transactionCount: metrics.transactionCount,
        averageBalance: metrics.averageBalance,
        fees: metrics.lateFees
      },
      accountCount: bank.accountCount
    };
  });

  // Sort by performance score
  rankings.sort((a, b) => b.performanceScore - a.performanceScore);

  return {
    rankings,
    bestPerformingBank: rankings[0]?.bankName || null,
    averageScore: rankings.length > 0 ? 
      Math.round(rankings.reduce((sum, bank) => sum + bank.performanceScore, 0) / rankings.length) : 0
  };
};

// Get Spending Patterns by Bank
export const getSpendingPatternsByBank = async (userId, days = 90) => {
  const bankComparison = await getBankComparison(userId, days);
  
  const patterns = bankComparison.banks.map(bank => {
    const spending = bank.metrics.spendingByCategory;
    const totalSpending = bank.metrics.totalSpending;
    
    // Calculate percentages
    const spendingPercentages = {};
    Object.keys(spending).forEach(category => {
      spendingPercentages[category] = totalSpending > 0 ? 
        Math.round((spending[category] / totalSpending) * 100) : 0;
    });
    
    // Find top spending category
    const topCategory = Object.keys(spending).reduce((a, b) => 
      spending[a] > spending[b] ? a : b, Object.keys(spending)[0] || 'none');
    
    return {
      bankName: bank.bankName,
      totalSpending: totalSpending,
      spendingByCategory: spending,
      spendingPercentages,
      topSpendingCategory: topCategory,
      topSpendingAmount: spending[topCategory] || 0
    };
  });

  return {
    patterns,
    insights: generateSpendingInsights(patterns)
  };
};

// Helper Functions
const getEmptyMetrics = () => ({
  totalIncome: 0,
  totalSpending: 0,
  savingsAmount: 0,
  savingsRatio: 0,
  spendingByCategory: {},
  averageBalance: 0,
  minBalance: 0,
  maxBalance: 0,
  overdrafts: 0,
  lateFees: 0,
  regularDeposits: 0,
  irregularDeposits: 0,
  consistencyScore: 0,
  transactionCount: 0
});

const calculateConsistencyScore = (deposits, days) => {
  if (deposits.length === 0) return 0;

  const expectedDeposits = Math.floor(days / 30);
  const actualDeposits = deposits.length;
  
  const depositDates = deposits.map(d => new Date(d.date).getDate());
  const avgDate = depositDates.reduce((a, b) => a + b, 0) / depositDates.length;
  const variance = depositDates.reduce((sum, date) => sum + Math.pow(date - avgDate, 2), 0) / depositDates.length;
  const timingScore = Math.max(0, 100 - variance);

  const frequencyScore = Math.min(100, (actualDeposits / Math.max(1, expectedDeposits)) * 100);

  return (timingScore + frequencyScore) / 2;
};

const generateSpendingInsights = (patterns) => {
  const insights = [];
  
  if (patterns.length === 0) return insights;
  
  // Find bank with highest spending
  const highestSpender = patterns.reduce((max, bank) => 
    bank.totalSpending > max.totalSpending ? bank : max);
  
  insights.push(`${highestSpender.bankName} accounts show the highest spending activity with ₦${highestSpender.totalSpending.toLocaleString()}.`);
  
  // Find most common spending category across banks
  const allCategories = {};
  patterns.forEach(bank => {
    Object.keys(bank.spendingByCategory).forEach(category => {
      allCategories[category] = (allCategories[category] || 0) + bank.spendingByCategory[category];
    });
  });
  
  const topGlobalCategory = Object.keys(allCategories).reduce((a, b) => 
    allCategories[a] > allCategories[b] ? a : b, Object.keys(allCategories)[0]);
  
  insights.push(`Across all banks, you spend most on ${topGlobalCategory} (₦${allCategories[topGlobalCategory].toLocaleString()}).`);
  
  return insights;
};
