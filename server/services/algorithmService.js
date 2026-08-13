const { getTransactions } = require('./transactionsService');
const { getSavingsGoals } = require('./savingsService');
const { getBudgets } = require('./budgetService');

const normalizeText = (value) => String(value || '').trim().toLowerCase();

const searchTransactions = async ({
  userId,
  category,
  type,
  amount,
  date,
  description,
}) => {
  const transactions = await getTransactions(userId);

  const searchCriteria = {
    category: normalizeText(category),
    type: normalizeText(type),
    amount: amount === undefined || amount === null || amount === '' ? null : Number(amount),
    date: normalizeText(date),
    description: normalizeText(description),
  };

  // Search Algorithm:
  // The algorithm iterates through each transaction and compares the
  // requested filter values against the stored fields. Matches are kept,
  // while non-matching records are discarded.
  const matches = transactions.filter((transaction) => {
    if (searchCriteria.category && !normalizeText(transaction.category).includes(searchCriteria.category)) {
      return false;
    }

    if (searchCriteria.type && normalizeText(transaction.type) !== searchCriteria.type) {
      return false;
    }

    if (searchCriteria.amount !== null) {
      const transactionAmount = Number(transaction.amount);

      if (!Number.isFinite(transactionAmount)) {
        return false;
      }

      if (Math.abs(transactionAmount - searchCriteria.amount) > 0.001) {
        return false;
      }
    }

    if (searchCriteria.date && !normalizeText(transaction.transaction_date).includes(searchCriteria.date)) {
      return false;
    }

    if (searchCriteria.description && !normalizeText(transaction.description).includes(searchCriteria.description)) {
      return false;
    }

    return true;
  });

  return {
    totalMatches: matches.length,
    transactions: matches,
    searchCriteria,
  };
};

const generateSavingsRecommendation = async ({ userId, availableAmount }) => {
  const goals = await getSavingsGoals(userId);
  const available = Number(availableAmount);

  if (!Number.isFinite(available) || available <= 0) {
    return {
      availableAmount: 0,
      recommendations: [],
      remainingBalance: 0,
      message: 'No money available for a new savings allocation.',
    };
  }

  // Greedy Algorithm:
  // At each step, we choose the savings goal with the greatest immediate need
  // based on the remaining amount still required to reach the target.
  const rankedGoals = goals
    .map((goal) => {
      const target = Number(goal.target_amount || 0);
      const saved = Number(goal.current_amount || 0);
      const remaining = Math.max(0, target - saved);
      const progress = target > 0 ? (saved / target) * 100 : 0;

      return {
        ...goal,
        target,
        saved,
        remaining,
        progress,
        priorityScore: remaining + (100 - progress) * 0.5,
      };
    })
    .filter((goal) => goal.remaining > 0)
    .sort(
      (left, right) =>
        right.priorityScore - left.priorityScore ||
        left.progress - right.progress ||
        left.target - right.target
    );

  let remainingBalance = available;
  const recommendations = [];

  for (const goal of rankedGoals) {
    if (remainingBalance <= 0) {
      break;
    }

    const allocated = Math.min(goal.remaining, remainingBalance);

    if (allocated <= 0) {
      continue;
    }

    recommendations.push({
      goalId: goal.id,
      goalName: goal.goal_name,
      targetAmount: goal.target,
      currentAmount: goal.saved,
      remainingAfterGoal: Number((goal.remaining - allocated).toFixed(2)),
      allocatedAmount: Number(allocated.toFixed(2)),
      priorityRule: 'Highest remaining need first',
    });

    remainingBalance = Number((remainingBalance - allocated).toFixed(2));
  }

  return {
    availableAmount: Number(available.toFixed(2)),
    recommendations,
    remainingBalance: Number(remainingBalance.toFixed(2)),
    explanation: 'Greedy Algorithm: repeatedly selects the savings goal with the biggest immediate shortfall before moving to the next goal.',
  };
};

const optimizeBudget = async ({ userId, month, year }) => {
  const budgets = await getBudgets(userId);
  const transactions = await getTransactions(userId);

  const targetMonth = Number(month) || new Date().getMonth() + 1;
  const targetYear = Number(year) || new Date().getFullYear();

  const monthlyIncome = transactions
    .filter((transaction) => transaction.type === 'income')
    .filter((transaction) => {
      const txDate = new Date(transaction.transaction_date);
      return (
        txDate.getMonth() + 1 === targetMonth &&
        txDate.getFullYear() === targetYear
      );
    })
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

  const monthlyExpenses = transactions
    .filter((transaction) => transaction.type === 'expense')
    .filter((transaction) => {
      const txDate = new Date(transaction.transaction_date);
      return (
        txDate.getMonth() + 1 === targetMonth &&
        txDate.getFullYear() === targetYear
      );
    })
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

  const currentBudgetTotal = budgets.reduce(
    (sum, budget) => sum + Number(budget.monthly_limit || 0),
    0
  );

  const disposableIncome = Math.max(0, monthlyIncome - monthlyExpenses);

  // Optimization Algorithm:
  // The algorithm calculates how much income is genuinely available after
  // expenses and then scales each budget category proportionally so the total
  // budget stays within that available amount. This keeps the method simple,
  // deterministic, and easy to explain.
  const scaleFactor = currentBudgetTotal > 0 && disposableIncome > 0
    ? Math.min(1.2, Math.max(0.3, disposableIncome / currentBudgetTotal))
    : 0;

  const recommendations = budgets.map((budget) => {
    const currentLimit = Number(budget.monthly_limit || 0);
    const recommendedLimit = currentLimit * scaleFactor;

    return {
      id: budget.id,
      category: budget.category,
      current: Number(currentLimit.toFixed(2)),
      recommended: Number(recommendedLimit.toFixed(2)),
      difference: Number((recommendedLimit - currentLimit).toFixed(2)),
    };
  });

  return {
    month: targetMonth,
    year: targetYear,
    totalIncome: Number(monthlyIncome.toFixed(2)),
    totalExpenses: Number(monthlyExpenses.toFixed(2)),
    disposableIncome: Number(disposableIncome.toFixed(2)),
    currentBudgetTotal: Number(currentBudgetTotal.toFixed(2)),
    recommendedBudgetTotal: Number(
      recommendations.reduce((sum, item) => sum + item.recommended, 0).toFixed(2)
    ),
    recommendations,
    explanation: 'Optimization Algorithm: rescale category budgets in proportion to available income after expenses so the total recommendation stays realistic.',
  };
};

module.exports = {
  searchTransactions,
  generateSavingsRecommendation,
  optimizeBudget,
};
