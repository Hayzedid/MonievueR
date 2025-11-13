// models/Account.js
import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accountId: { type: String, required: true, unique: true },
  accountNumber: { type: String, required: true },
  accountName: { type: String, required: true },
  bankName: { type: String, required: true },
  bankCode: String,
  accountType: {
    type: String,
    enum: ['savings', 'current', 'fixed_deposit', 'credit'],
    default: 'savings',
  },
  balance: { type: Number, default: 0 },
  currency: { type: String, default: 'NGN' },
  isActive: { type: Boolean, default: true },
  connectedAt: { type: Date, default: Date.now },
  lastSyncedAt: Date,
}, { timestamps: true });

accountSchema.index({ userId: 1 });

export default mongoose.model('Account', accountSchema);
