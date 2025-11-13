// index.js
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import authRoutes from './routes/auth.js';
import bankRoutes from './routes/bankRoutes.js';
import accountsRoute from './routes/accounts.js';
import transactionsRoute from './routes/transactions.js';
import aggregateRoute from './routes/aggregate.js';
import aiRoutes from './routes/aiRoutes.js';
import analyticsRoutes from './routes/analytics.js';
import advancedRoutes from './routes/advancedRoutes.js';
import testRoutes from './routes/testRoutes.js';
import userRoutes from './routes/userRoutes.js';
import bankAnalyticsRoutes from './routes/bankAnalyticsRoutes.js';

const app = express();
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
app.use('/auth', authRoutes);
app.use('/bank', bankRoutes);
app.use('/accounts', accountsRoute);
app.use('/transactions', transactionsRoute);
app.use('/', aggregateRoute); // or '/aggregate'
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/advanced', advancedRoutes);
app.use('/api/test', testRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bank-analytics', bankAnalyticsRoutes);

// Start server (only if this file is run directly)
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 FinHub Backend with Advanced AI Analytics running on port ${PORT}`);
    console.log(`📊 Analytics API: http://localhost:${PORT}/api/analytics`);
    console.log(`🏦 Bank Analytics: http://localhost:${PORT}/api/bank-analytics`);
    console.log(`🧠 Advanced AI: http://localhost:${PORT}/api/advanced`);
    console.log(`🤖 AI API: http://localhost:${PORT}/api/ai`);
    console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
    console.log(`🧪 Test API: http://localhost:${PORT}/api/test`);
    console.log(`🔐 Auth API: http://localhost:${PORT}/auth`);
    console.log(`🏦 Banking API: http://localhost:${PORT}/bank`);
  });
}

export { app };
