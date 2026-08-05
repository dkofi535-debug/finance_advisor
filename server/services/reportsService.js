const supabase = require('../config/supabase');

const getMonthlyReportData = async (userId) => {
  const { data: transactions, error: transactionsError } = await supabase
    .from('transactions')
    .select('type, amount')
    .eq('user_id', userId);

  if (transactionsError) {
    const dbError = new Error(`Failed to fetch transactions: ${transactionsError.message}`);
    dbError.statusCode = 500;
    throw dbError;
  }

 const totalIncome = (transactions || [])
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const totalExpenses = (transactions || [])
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  return {
    total_income: Number(totalIncome.toFixed(2)),
    total_expenses: Number(totalExpenses.toFixed(2)),
    net_balance: Number((totalIncome - totalExpenses).toFixed(2)),
   total_transactions: (transactions || []).length,
  };
};

const getCategoryReportData = async (userId) => {
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('category, amount')
    .eq('user_id', userId)
    .eq('type', 'expense');

  if (error) {
    const dbError = new Error(`Failed to fetch expenses by category: ${error.message}`);
    dbError.statusCode = 500;
    throw dbError;
  }

  const grouped = transactions.reduce((acc, transaction) => {
    const category = transaction.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += Number(transaction.amount);
    return acc;
  }, {});

  return Object.entries(grouped).map(([category, total]) => ({
    category,
    total_expenses: Number(total.toFixed(2)),
  }));
};

const getBudgetReportData = async (userId) => {
  const { data: budgets, error: budgetsError } = await supabase
    .from('budgets')
    .select('category, monthly_limit')
    .eq('user_id', userId);

  if (budgetsError) {
    const dbError = new Error(`Failed to fetch budgets: ${budgetsError.message}`);
    dbError.statusCode = 500;
    throw dbError;
  }

  const { data: expenses, error: expensesError } = await supabase
    .from('transactions')
    .select('category, amount')
    .eq('user_id', userId)
    .eq('type', 'expense');

  if (expensesError) {
    const dbError = new Error(`Failed to fetch expenses: ${expensesError.message}`);
    dbError.statusCode = 500;
    throw dbError;
  }

  return budgets.map((budget) => {
    const totalSpent = expenses
      .filter((expense) => expense.category === budget.category)
      .reduce((sum, expense) => sum + Number(expense.amount), 0);

    return {
      category: budget.category,
      monthly_limit: Number(budget.monthly_limit),
      total_spent: Number(totalSpent.toFixed(2)),
      remaining_budget: Number((Number(budget.monthly_limit) - totalSpent).toFixed(2)),
    };
  });
};

const getSavingsReportData = async (userId) => {
  const { data: savingsGoals, error } = await supabase
    .from('savings_goals')
    .select('target_amount, current_amount')
    .eq('user_id', userId);

  if (error) {
    const dbError = new Error(`Failed to fetch savings goals: ${error.message}`);
    dbError.statusCode = 500;
    throw dbError;
  }

  const totalTargetAmount = (savingsGoals || []).reduce((sum, goal) => sum + Number(goal.target_amount), 0);
  const totalSaved = (savingsGoals || []).reduce((sum, goal) => sum + Number(goal.current_amount), 0);

  return {
    total_target_amount: Number(totalTargetAmount.toFixed(2)),
    total_saved: Number(totalSaved.toFixed(2)),
    remaining_to_save: Number((totalTargetAmount - totalSaved).toFixed(2)),
    number_of_goals: (savingsGoals || []).length,
  };
};

module.exports = {
  getMonthlyReportData,
  getCategoryReportData,
  getBudgetReportData,
  getSavingsReportData,
};
