import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accountId: { type: String, required: true },
  monoTransactionId: { type: String, unique: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['debit', 'credit'], required: true },
  category: {
    type: String,
    enum: [
      'salary', 'transfer_in', 'transfer_out', 'food', 'transport', 
      'utilities', 'entertainment', 'shopping', 'healthcare', 
      'education', 'savings', 'investment', 'fees', 'overdraft', 'other'
    ],
    default: 'other',
  },
  description: String,
  merchant: String,
  date: { type: Date, required: true },
  balance: Number,
  syncedAt: { type: Date, default: Date.now },
}, { timestamps: true });

transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1 });

export default mongoose.model('Transaction', transactionSchema);
