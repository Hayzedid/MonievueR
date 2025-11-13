import axios from 'axios';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';

/**
 * Generate mock transactions for a given account
 */
function generateTransactions(accountId) {
  const merchants = ['Shoprite', 'Jumia', 'KFC', 'Uber', 'Bolt'];
  const types = ['debit', 'credit'];

  const transactions = Array.from({ length: 5 }).map(() => ({
    accountId,
    amount: Math.floor(Math.random() * 5000) + 500,
    type: types[Math.floor(Math.random() * 2)],
    description: 'Mock transaction',
    merchant: merchants[Math.floor(Math.random() * merchants.length)],
    date: new Date(),
  }));

  return transactions;
}

/**
 * Simulate syncing all mock bank accounts for a user
 */
export async function syncAllAccounts(userId, mockAccounts) {
  const allTransactions = [];

  for (const account of mockAccounts) {
    // Save account to DB
    const savedAccount = await Account.create({
      userId,
      bankName: account.bankName,
      accountNumber: `${Math.floor(Math.random() * 1e10)}`,
      balance: Math.floor(Math.random() * 200000),
    });

    // Generate mock transactions for the account
    const transactions = generateTransactions(savedAccount._id);
    allTransactions.push(...transactions);
  }

  // Save all transactions to DB
  await Transaction.insertMany(allTransactions.map(tx => ({ ...tx, userId })));

  // Send to Backend 2 (optional)
  await sendTransactionsToBackend2(userId, allTransactions);

  return allTransactions;
}

/**
 * Send transactions from Backend 1 → Backend 2
 */
async function sendTransactionsToBackend2(userId, transactions) {
  try {
    const backend2URL = 'http://localhost:5000/api/transactions'; // change to deployed link later

    const response = await axios.post(backend2URL, {
      userId,
      transactions,
    });

    console.log('Synced with Backend 2:', response.data);
  } catch (err) {
    console.error('Error sending to Backend 2:', err.message);
  }
}
