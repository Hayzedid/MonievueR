import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";

// List of supported banks
const BANKS = ["Wema Bank", "GTBank", "Opay", "FirstBank"];

// Utility to generate random transactions
const generateMockTransactions = (accountId) => {
  const transactions = [];
  const types = ["credit", "debit"];

  for (let i = 0; i < 5; i++) {
    const amount = Math.floor(Math.random() * 5000) + 500; // 500 - 5500
    const type = types[Math.floor(Math.random() * types.length)];

    transactions.push({
      accountId,
      amount,
      type,
      description: `${type} of NGN ${amount}`,
      date: new Date(Date.now() - Math.floor(Math.random() * 1000000000)),
    });
  }

  return transactions;
};

// Connect a bank for a user
export const connectBank = async (req, res) => {
  try {
    const { userId, bankName } = req.body;

    if (!BANKS.includes(bankName)) {
      return res.status(400).json({ message: "Bank not supported" });
    }

    // Simulate creating account with random balance
    const balance = Math.floor(Math.random() * 50000) + 1000; // 1k - 51k
    const newAccount = await Account.create({
      userId,
      bankName,
      balance,
    });

    // Generate mock transactions for this account
    const transactions = generateMockTransactions(newAccount._id);
    await Transaction.insertMany(transactions);

    res.json({
      message: `${bankName} connected successfully`,
      account: newAccount,
      transactions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
