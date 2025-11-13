// models/BankToken.js
import mongoose from 'mongoose';

const bankTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bankName: String,
  token: String, // access token from bank
  expiresAt: Date,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('BankToken', bankTokenSchema);
