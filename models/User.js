import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    // Basic user information
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    
    // Mono integration
    monoCustomerId: {
      type: String,
      unique: true,
      sparse: true,
    },
    monoAccessToken: {
      type: String,
      select: false,
    },
    tokenExpiresAt: {
      type: Date,
    },
    
    // Connected bank accounts
    connectedAccounts: [
      {
        accountId: String,
        bankName: String,
        accountNumber: String,
        connectedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    
    // AI Analytics data
    moneyPersonality: {
      type: String,
      enum: ['Planner', 'Spender', 'Minimalist', 'Balancer', 'Unknown'],
      default: 'Unknown',
    },
    creditScore: {
      type: Number,
      min: 0,
      max: 1000,
    },
    lastAnalyzedAt: Date,
  },
  { 
    timestamps: true 
  }
);

export default mongoose.model('User', userSchema);
