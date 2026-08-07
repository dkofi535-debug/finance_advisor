import api from "../api/axios";

export const getDashboardData = async () => {
  const [
    monthly,
    budget,
    savings,
    transactions,
  ] = await Promise.all([
    api.get("/reports/monthly"),
    api.get("/reports/budget"),
    api.get("/reports/savings"),
    api.get("/transactions"),
  ]);

  return {
    monthly: monthly.data.data,
    budgets: budget.data.data,
    savings: savings.data.data,
    transactions: transactions.data.transactions,
  };
};