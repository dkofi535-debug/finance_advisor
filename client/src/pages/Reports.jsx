import React, { useEffect, useMemo, useState } from 'react';
import { getTransactions } from '../services/transactionsService';

const Reports = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await getTransactions();

      setTransactions(response?.transactions || []);
    } catch (err) {
      console.error('Reports error:', err);
      setError('Failed to load report data.');
    } finally {
      setLoading(false);
    }
  };

  const reportData = useMemo(() => {
    const incomeTransactions = transactions.filter(
      (transaction) => transaction.type === 'income'
    );

    const expenseTransactions = transactions.filter(
      (transaction) => transaction.type === 'expense'
    );

    const totalIncome = incomeTransactions.reduce(
      (total, transaction) => total + Number(transaction.amount || 0),
      0
    );

    const totalExpenses = expenseTransactions.reduce(
      (total, transaction) => total + Number(transaction.amount || 0),
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

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        Loading reports...
      </div>
    );
  }

  return (
    <div className="space-y-8">
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
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Total Income
          </p>

          <p className="mt-2 text-2xl font-bold text-green-600">
            GH₵ {reportData.totalIncome.toFixed(2)}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Total Expenses
          </p>

          <p className="mt-2 text-2xl font-bold text-red-600">
            GH₵ {reportData.totalExpenses.toFixed(2)}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Net Balance
          </p>

          <p
            className={`mt-2 text-2xl font-bold ${
              reportData.balance >= 0
                ? 'text-blue-600'
                : 'text-red-600'
            }`}
          >
            GH₵ {reportData.balance.toFixed(2)}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Transactions
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-slate-100">
            {reportData.transactionCount}
          </p>
        </div>
      </div>

      {/* SUMMARY */}
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
                {reportData.transactionCount}
              </span>
            </div>
          </div>
        </div>

        {/* EXPENSE CATEGORIES */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
            Expense Categories
          </h2>

          {Object.keys(reportData.categoryTotals).length === 0 ? (
            <p className="mt-6 text-sm text-gray-500 dark:text-slate-400">
              No expense data available.
            </p>
          ) : (
            <div className="mt-6 space-y-4">
              {Object.entries(reportData.categoryTotals).map(
                ([category, amount]) => (
                  <div
                    key={category}
                    className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-slate-700"
                  >
                    <span className="text-gray-600 dark:text-slate-400">
                      {category}
                    </span>

                    <span className="font-semibold text-red-600">
                      GH₵ {amount.toFixed(2)}
                    </span>
                  </div>
                )
              )}
            </div>
          )}
        </div>
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
                  const isIncome = transaction.type === 'income';

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
                        {Number(transaction.amount || 0).toFixed(2)}
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