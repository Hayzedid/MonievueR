import axios from 'axios';

export const getBankBalances = async (userId) => {
  try {
    // For now, we'll mock balances
    const balances = [
      { bankName: 'GTBank', balance: 54321.75, currency: 'NGN' },
      { bankName: 'Opay', balance: 23000.00, currency: 'NGN' },
      { bankName: 'Wema', balance: 12000.50, currency: 'NGN' },
      { bankName: 'FirstBank', balance: 78500.00, currency: 'NGN' },
    ];

    return balances;
  } catch (error) {
    console.error('Error fetching bank balances:', error.message);
    throw error;
  }
};
