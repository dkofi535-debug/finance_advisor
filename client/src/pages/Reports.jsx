import React, { useEffect, useMemo, useState } from 'react';
import { getTransactions } from '../services/transactionsService';
import {
  getMonthlyReport,
  getCategoryReport,
  getBudgetReport,
  getSavingsReport,
} from '../services/reportsService';

const Reports = () => {
  const [transactions, setTransactions] = useState([]);

  const [monthlyReport, setMonthlyReport] = useState(null);
  const [categoryReport, setCategoryReport] = useState([]);
  const [budgetReport, setBudgetReport] = useState([]);
  const [savingsReport, setSavingsReport] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError('');

      const [
        transactionsResponse,
        monthlyResponse,
        categoryResponse,
        budgetResponse,
        savingsResponse,
      ] = await Promise.all([
        getTransactions(),
        getMonthlyReport(),
        getCategoryReport(),
        getBudgetReport(),
        getSavingsReport(),
      ]);

      // Transactions
      setTransactions(transactionsResponse?.transactions || []);

      // Monthly report
      setMonthlyReport(monthlyResponse?.data || null);

      // Category report
      setCategoryReport(categoryResponse?.data || []);

      // Budget report
      setBudgetReport(budgetResponse?.data || []);

      // Savings report
      setSavingsReport(savingsResponse?.data || null);
    } catch (err) {
      console.error('Reports error:', err);
      setError('Failed to load report data.');
    } finally {
      setLoading(false);
    }
  };

  /*
   * Transaction-based calculations
   *
   * We keep these because your existing Reports page
   * already uses the transactions for the recent
   * transactions table and transaction counts.
   */
  const reportData = useMemo(() => {
    const incomeTransactions = transactions.filter(
      (transaction) => transaction.type === 'income'
    );

    const expenseTransactions = transactions.filter(
      (transaction) => transaction.type === 'expense'
    );

    const totalIncome = incomeTransactions.reduce(
      (total, transaction) =>
        total + Number(transaction.amount || 0),
      0
    );

    const totalExpenses = expenseTransactions.reduce(
      (total, transaction) =>
        total + Number(transaction.amount || 0),
      0
    );

    const balance = totalIncome - totalExpenses;

    const categoryTotals = {};

    expenseTransactions.forEach((transaction) => {
      const category = transaction.category || 'Other';

      categoryTotals[category] =
        (categoryTotals[category] || 0) +
        Number(transaction.amount || 0);
    });

    return {
      totalIncome,
      totalExpenses,
      balance,
      transactionCount: transactions.length,
      incomeCount: incomeTransactions.length,
      expenseCount: expenseTransactions.length,
      categoryTotals,
    };
  }, [transactions]);

  /*
   * Prefer the backend monthly report for the main
   * financial totals when available.
   */
  const totalIncome =
    monthlyReport?.total_income ?? reportData.totalIncome;

  const totalExpenses =
    monthlyReport?.total_expenses ?? reportData.totalExpenses;

  const netBalance =
    monthlyReport?.net_balance ?? reportData.balance;

  const totalTransactions =
    monthlyReport?.total_transactions ??
    reportData.transactionCount;

  /*
   * Chart percentages
   */
  const chartTotal = totalIncome + totalExpenses;

  const incomePercentage =
    chartTotal > 0
      ? (totalIncome / chartTotal) * 100
      : 0;

  const expensePercentage =
    chartTotal > 0
      ? (totalExpenses / chartTotal) * 100
      : 0;

  /*
   * Budget totals
   */
  const budgetSummary = useMemo(() => {
    const totalLimit = budgetReport.reduce(
      (sum, budget) =>
        sum + Number(budget.monthly_limit || 0),
      0
    );

    const totalSpent = budgetReport.reduce(
      (sum, budget) =>
        sum + Number(budget.total_spent || 0),
      0
    );

    const totalRemaining = budgetReport.reduce(
      (sum, budget) =>
        sum + Number(budget.remaining_budget || 0),
      0
    );

    return {
      totalLimit,
      totalSpent,
      totalRemaining,
    };
  }, [budgetReport]);

  /*
   * Loading state
   */
  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Loading reports...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-slate-100">
          Reports
        </h1>

        <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
          View a summary of your financial activity.
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* TOTAL INCOME */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Total Income
          </p>

          <p className="mt-2 text-2xl font-bold text-green-600">
            GH₵ {Number(totalIncome).toFixed(2)}
          </p>
        </div>

        {/* TOTAL EXPENSES */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Total Expenses
          </p>

          <p className="mt-2 text-2xl font-bold text-red-600">
            GH₵ {Number(totalExpenses).toFixed(2)}
          </p>
        </div>

        {/* NET BALANCE */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Net Balance
          </p>

          <p
            className={`mt-2 text-2xl font-bold ${
              Number(netBalance) >= 0
                ? 'text-blue-600'
                : 'text-red-600'
            }`}
          >
            GH₵ {Number(netBalance).toFixed(2)}
          </p>
        </div>

        {/* TRANSACTIONS */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Transactions
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-slate-100">
            {totalTransactions}
          </p>
        </div>

      </div>

      {/* FINANCIAL CHART */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
            Financial Overview
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Comparison of your total income and expenses.
          </p>
        </div>

        <div className="space-y-6">

          {/* INCOME BAR */}
          <div>
            <div className="mb-2 flex items-center justify-between">

              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Income
              </span>

              <span className="text-sm font-semibold text-green-600">
                GH₵ {Number(totalIncome).toFixed(2)}
              </span>

            </div>

            <div className="h-6 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-slate-800">

              <div
                className="h-full rounded-full bg-green-500 transition-all duration-500"
                style={{
                  width: `${incomePercentage}%`,
                }}
              />

            </div>

          </div>

          {/* EXPENSE BAR */}
          <div>

            <div className="mb-2 flex items-center justify-between">

              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Expenses
              </span>

              <span className="text-sm font-semibold text-red-600">
                GH₵ {Number(totalExpenses).toFixed(2)}
              </span>

            </div>

            <div className="h-6 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-slate-800">

              <div
                className="h-full rounded-full bg-red-500 transition-all duration-500"
                style={{
                  width: `${expensePercentage}%`,
                }}
              />

            </div>

          </div>

        </div>

      </div>

      {/* TRANSACTION + CATEGORY SUMMARY */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* TRANSACTION SUMMARY */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">

          <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
            Transaction Summary
          </h2>

          <div className="mt-6 space-y-4">

            <div className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-slate-700">

              <span className="text-gray-600 dark:text-slate-400">
                Income Transactions
              </span>

              <span className="font-semibold text-green-600">
                {reportData.incomeCount}
              </span>

            </div>

            <div className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-slate-700">

              <span className="text-gray-600 dark:text-slate-400">
                Expense Transactions
              </span>

              <span className="font-semibold text-red-600">
                {reportData.expenseCount}
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-gray-600 dark:text-slate-400">
                Total Transactions
              </span>

              <span className="font-semibold text-gray-900 dark:text-slate-100">
                {totalTransactions}
              </span>

            </div>

          </div>

        </div>

        {/* EXPENSE CATEGORIES */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">

          <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
            Expense Categories
          </h2>

          {categoryReport.length === 0 ? (

            <p className="mt-6 text-sm text-gray-500 dark:text-slate-400">
              No expense data available.
            </p>

          ) : (

            <div className="mt-6 space-y-4">

              {categoryReport.map((item) => (

                <div
                  key={item.category}
                  className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-slate-700"
                >

                  <span className="text-gray-600 dark:text-slate-400">
                    {item.category}
                  </span>

                  <span className="font-semibold text-red-600">
                    GH₵ {Number(item.total_expenses || 0).toFixed(2)}
                  </span>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

      {/* BUDGET REPORT */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">

        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
              Budget Report
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              See how your spending compares with your monthly budgets.
            </p>
          </div>

          {budgetReport.length > 0 && (
            <div className="text-sm text-gray-500 dark:text-slate-400">
              {budgetReport.length}{' '}
              {budgetReport.length === 1 ? 'budget' : 'budgets'}
            </div>
          )}

        </div>

        {budgetReport.length === 0 ? (

          <div className="rounded-xl bg-gray-50 p-6 text-center dark:bg-slate-800">
            <p className="text-sm text-gray-500 dark:text-slate-400">
              No budgets available.
            </p>

            <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
              Create a budget to start tracking your spending.
            </p>
          </div>

        ) : (

          <div className="space-y-6">

            {/* BUDGET TOTALS */}
            <div className="grid gap-4 sm:grid-cols-3">

              <div className="rounded-xl bg-gray-50 p-4 dark:bg-slate-800">
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Total Budget
                </p>

                <p className="mt-1 text-xl font-bold text-gray-900 dark:text-slate-100">
                  GH₵ {budgetSummary.totalLimit.toFixed(2)}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4 dark:bg-slate-800">
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Total Spent
                </p>

                <p className="mt-1 text-xl font-bold text-red-600">
                  GH₵ {budgetSummary.totalSpent.toFixed(2)}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4 dark:bg-slate-800">
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Remaining
                </p>

                <p
                  className={`mt-1 text-xl font-bold ${
                    budgetSummary.totalRemaining >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  GH₵ {budgetSummary.totalRemaining.toFixed(2)}
                </p>
              </div>

            </div>

            {/* BUDGET TABLE */}
            <div className="overflow-x-auto">

              <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-slate-700">

                <thead className="bg-gray-50 dark:bg-slate-800">

                  <tr>

                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-slate-300">
                      Category
                    </th>

                    <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-slate-300">
                      Monthly Limit
                    </th>

                    <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-slate-300">
                      Spent
                    </th>

                    <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-slate-300">
                      Remaining
                    </th>

                    <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-slate-300">
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">

                  {budgetReport.map((budget) => {

                    const limit = Number(
                      budget.monthly_limit || 0
                    );

                    const spent = Number(
                      budget.total_spent || 0
                    );

                    const remaining = Number(
                      budget.remaining_budget || 0
                    );

                    const isOverBudget = remaining < 0;

                    const percentage =
                      limit > 0
                        ? Math.min(
                            (spent / limit) * 100,
                            100
                          )
                        : 0;

                    return (

                      <tr
                        key={budget.category}
                        className="bg-white dark:bg-slate-900"
                      >

                        <td className="px-4 py-4">

                          <div>
                            <p className="font-medium text-gray-900 dark:text-slate-100">
                              {budget.category}
                            </p>

                            <div className="mt-2 h-2 w-32 overflow-hidden rounded-full bg-gray-100 dark:bg-slate-800">

                              <div
                                className={`h-full rounded-full transition-all ${
                                  isOverBudget
                                    ? 'bg-red-500'
                                    : 'bg-blue-500'
                                }`}
                                style={{
                                  width: `${percentage}%`,
                                }}
                              />

                            </div>
                          </div>

                        </td>

                        <td className="px-4 py-4 text-right text-gray-700 dark:text-slate-300">
                          GH₵ {limit.toFixed(2)}
                        </td>

                        <td className="px-4 py-4 text-right font-semibold text-red-600">
                          GH₵ {spent.toFixed(2)}
                        </td>

                        <td
                          className={`px-4 py-4 text-right font-semibold ${
                            isOverBudget
                              ? 'text-red-600'
                              : 'text-green-600'
                          }`}
                        >
                          GH₵ {remaining.toFixed(2)}
                        </td>

                        <td className="px-4 py-4 text-center">

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              isOverBudget
                                ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                                : 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                            }`}
                          >
                            {isOverBudget
                              ? 'Over Budget'
                              : 'Within Budget'}
                          </span>

                        </td>

                      </tr>

                    );

                  })}

                </tbody>

              </table>

            </div>

          </div>

        )}

      </div>

      {/* SAVINGS REPORT */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">

        <div className="mb-6">

          <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
            Savings Report
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Track your progress toward your savings goals.
          </p>

        </div>

        {!savingsReport ||
        savingsReport.number_of_goals === 0 ? (

          <div className="rounded-xl bg-gray-50 p-6 text-center dark:bg-slate-800">

            <p className="text-sm text-gray-500 dark:text-slate-400">
              No savings goals available.
            </p>

            <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
              Create a savings goal to start tracking your progress.
            </p>

          </div>

        ) : (

          <div className="space-y-6">

            {/* SAVINGS SUMMARY */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              {/* NUMBER OF GOALS */}
              <div className="rounded-xl bg-gray-50 p-4 dark:bg-slate-800">

                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Savings Goals
                </p>

                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-slate-100">
                  {savingsReport.number_of_goals}
                </p>

              </div>

              {/* TARGET */}
              <div className="rounded-xl bg-gray-50 p-4 dark:bg-slate-800">

                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Total Target
                </p>

                <p className="mt-1 text-2xl font-bold text-blue-600">
                  GH₵{' '}
                  {Number(
                    savingsReport.total_target_amount || 0
                  ).toFixed(2)}
                </p>

              </div>

              {/* SAVED */}
              <div className="rounded-xl bg-gray-50 p-4 dark:bg-slate-800">

                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Currently Saved
                </p>

                <p className="mt-1 text-2xl font-bold text-green-600">
                  GH₵{' '}
                  {Number(
                    savingsReport.total_saved || 0
                  ).toFixed(2)}
                </p>

              </div>

              {/* REMAINING */}
              <div className="rounded-xl bg-gray-50 p-4 dark:bg-slate-800">

                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Remaining
                </p>

                <p
                  className={`mt-1 text-2xl font-bold ${
                    Number(
                      savingsReport.remaining_to_save || 0
                    ) > 0
                      ? 'text-orange-600'
                      : 'text-green-600'
                  }`}
                >
                  GH₵{' '}
                  {Number(
                    savingsReport.remaining_to_save || 0
                  ).toFixed(2)}
                </p>

              </div>

            </div>

            {/* SAVINGS PROGRESS */}
            <div>

              <div className="mb-2 flex items-center justify-between">

                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Overall Savings Progress
                </span>

                <span className="text-sm font-semibold text-green-600">

                  {Number(
                    savingsReport.total_target_amount || 0
                  ) > 0
                    ? Math.min(
                        (
                          Number(
                            savingsReport.total_saved || 0
                          ) /
                          Number(
                            savingsReport.total_target_amount || 0
                          )
                        ) * 100,
                        100
                      ).toFixed(1)
                    : '0.0'}
                  %

                </span>

              </div>

              <div className="h-6 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-slate-800">

                <div
                  className="h-full rounded-full bg-green-500 transition-all duration-500"
                  style={{
                    width: `${
                      Number(
                        savingsReport.total_target_amount || 0
                      ) > 0
                        ? Math.min(
                            (
                              Number(
                                savingsReport.total_saved || 0
                              ) /
                              Number(
                                savingsReport.total_target_amount || 0
                              )
                            ) * 100,
                            100
                          )
                        : 0
                    }%`,
                  }}
                />

              </div>

            </div>

          </div>

        )}

      </div>

      {/* RECENT TRANSACTIONS */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">

        <div className="mb-4 flex items-center justify-between">

          <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
            Recent Transactions
          </h2>

          <span className="text-sm text-gray-500 dark:text-slate-400">
            {transactions.length} total
          </span>

        </div>

        {transactions.length === 0 ? (

          <p className="text-sm text-gray-500 dark:text-slate-400">
            No transactions available.
          </p>

        ) : (

          <div className="overflow-x-auto">

            <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-slate-700">

              <thead className="bg-gray-50 dark:bg-slate-800">

                <tr>

                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-slate-300">
                    Date
                  </th>

                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-slate-300">
                    Type
                  </th>

                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-slate-300">
                    Category
                  </th>

                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-slate-300">
                    Amount
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">

                {transactions.slice(0, 10).map((transaction) => {

                  const isIncome =
                    transaction.type === 'income';

                  return (

                    <tr
                      key={transaction.id}
                      className="bg-white dark:bg-slate-900"
                    >

                      <td className="px-4 py-3 text-gray-700 dark:text-slate-300">
                        {transaction.transaction_date}
                      </td>

                      <td className="px-4 py-3">

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            isIncome
                              ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                          }`}
                        >
                          {transaction.type}
                        </span>

                      </td>

                      <td className="px-4 py-3 text-gray-700 dark:text-slate-300">
                        {transaction.category}
                      </td>

                      <td
                        className={`px-4 py-3 font-semibold ${
                          isIncome
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {isIncome ? '+' : '-'} GH₵{' '}
                        {Number(
                          transaction.amount || 0
                        ).toFixed(2)}
                      </td>

                    </tr>

                  );
                })}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
};

export default Reports;