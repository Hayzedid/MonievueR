import Transaction from '../models/Transaction.js';

export const getTransactionsByUserId = async (userId, days = 90) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const transactions = await Transaction.find({
    userId,
    date: { $gte: startDate },
  })
    .sort({ date: -1 })
    .lean();

  return transactions;
};

export const createTransaction = async (transactionData) => {
  const transaction = new Transaction(transactionData);
  return await transaction.save();
};

export const getTransactionsByCategory = async (userId, category, days = 90) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await Transaction.find({
    userId,
    category,
    date: { $gte: startDate },
  }).sort({ date: -1 });
};

export const getMonthlySpending = async (userId, months = 6) => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const transactions = await Transaction.aggregate([
    {
      $match: {
        userId: userId,
        type: 'debit',
        date: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
        },
        totalSpending: { $sum: '$amount' },
        transactionCount: { $sum: 1 },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 },
    },
  ]);

  return transactions;
};
