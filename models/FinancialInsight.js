import mongoose from 'mongoose';

const financialInsightSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    period: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly'],
      default: 'monthly',
    },
    totalIncome: Number,
    totalSpending: Number,
    savingsAmount: Number,
    savingsRatio: Number,
    spendingByCategory: {
      type: Map,
      of: Number,
    },
    averageBalance: Number,
    minBalance: Number,
    maxBalance: Number,
    overdrafts: Number,
    lateFees: Number,
    regularDeposits: Number,
    irregularDeposits: Number,
    consistencyScore: Number,
    moneyPersonality: String,
    emotionalInsight: String,
    creditScoreFactors: {
      savingsBehavior: Number,
      spendingConsistency: Number,
      overdraftRisk: Number,
      incomeStability: Number,
    },
    creditScore: Number,
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

financialInsightSchema.index({ userId: 1, period: 1, generatedAt: -1 });

export default mongoose.model('FinancialInsight', financialInsightSchema);
