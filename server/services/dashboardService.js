const supabase = require('../config/supabase');

const getDashboardSummary = async (userId) => {
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('id, type, category, amount, description, transaction_date, created_at')
    .eq('user_id', userId)
    .order('transaction_date', { ascending: false });

  if (error) {
    const dbError = new Error(`Failed to fetch dashboard data: ${error.message}`);
    dbError.statusCode = 500;
    throw dbError;
  }

 const transactionList = transactions || [];

const totalIncome = transactionList.reduce((sum, transaction) => {
  return transaction.type === 'income'
    ? sum + Number(transaction.amount)
    : sum;
}, 0);

const totalExpenses = transactionList.reduce((sum, transaction) => {
  return transaction.type === 'expense'
    ? sum + Number(transaction.amount)
    : sum;
}, 0);
  return {
    total_income: Number(totalIncome.toFixed(2)),
    total_expenses: Number(totalExpenses.toFixed(2)),
    current_balance: Number((totalIncome - totalExpenses).toFixed(2)),
    total_transactions: transactions.length,
    recent_transactions: (transactions || []).slice(0, 5),
  };
};

module.exports = {
  getDashboardSummary,
};
