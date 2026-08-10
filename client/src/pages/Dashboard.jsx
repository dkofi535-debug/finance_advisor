import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardData } from '../services/dashboardService';

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getDashboardData();

      console.log('Dashboard data:', response);

      setData(response);
    } catch (err) {
      console.error('Dashboard error:', err);
      setError('Unable to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const monthly = data?.monthly || {};
  const budgets = Array.isArray(data?.budgets) ? data.budgets : [];
  const savings = data?.savings || {};
  const transactions = Array.isArray(data?.transactions)
    ? data.transactions
    : [];

  const recentTransactions = transactions.slice(0, 5);

  const totalSaved = Number(savings.total_saved || 0);
  const totalTarget = Number(savings.total_target_amount || 0);
  const remainingToSave = Number(savings.remaining_to_save || 0);
  const numberOfGoals = Number(savings.number_of_goals || 0);

  const savingsPercentage =
    totalTarget > 0
      ? Math.min((totalSaved / totalTarget) * 100, 100)
      : 0;

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
          Welcome back
        </h1>

        <p className="mt-2 text-lg font-medium text-slate-700 dark:text-slate-300">
          Your finance dashboard
        </p>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          A polished overview of income, expenses, budgets, savings, and
          recent activity.
        </p>
      </div>

      {/* QUICK LINKS */}
      <div className="flex flex-wrap gap-3">
        <Link
          to="/transactions"
          className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Transactions
        </Link>

        <Link
          to="/budgets"
          className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Budgets
        </Link>

        <Link
          to="/savings"
          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Savings
        </Link>

        <Link
          to="/reports"
          className="rounded-full bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500"
        >
          Reports
        </Link>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          Loading dashboard metrics...
        </div>
      )}

      {/* ERROR */}
      {!loading && error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          <p>{error}</p>

          <button
            type="button"
            onClick={loadDashboard}
            className="mt-4 inline-flex rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* DASHBOARD */}
      {!loading && !error && (
        <>
          {/* SUMMARY CARDS */}
          <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[1.75rem] border border-green-200 bg-emerald-50 p-6 shadow-sm dark:border-emerald-900 dark:bg-slate-900">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
                Total Income
              </p>

              <p className="mt-4 text-3xl font-semibold text-emerald-900 dark:text-emerald-300">
                GH₵ {Number(monthly.total_income || 0).toFixed(2)}
              </p>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Monthly income total from all sources.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-red-200 bg-red-50 p-6 shadow-sm dark:border-red-900 dark:bg-slate-900">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-700 dark:text-red-400">
                Total Expenses
              </p>

              <p className="mt-4 text-3xl font-semibold text-red-900 dark:text-red-300">
                GH₵ {Number(monthly.total_expenses || 0).toFixed(2)}
              </p>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Total spending for the current month.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-blue-200 bg-sky-50 p-6 shadow-sm dark:border-blue-900 dark:bg-slate-900">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-400">
                Net Balance
              </p>

              <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                GH₵ {Number(monthly.net_balance || 0).toFixed(2)}
              </p>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                What remains after income and expenses.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-6 shadow-sm dark:border-emerald-900 dark:bg-slate-900">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
                Total Savings
              </p>

              <p className="mt-4 text-3xl font-semibold text-emerald-900 dark:text-emerald-300">
                GH₵ {totalSaved.toFixed(2)}
              </p>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Current savings based on goals and progress.
              </p>
            </div>
          </section>

          {/* BUDGET + SAVINGS */}
          <section className="grid gap-6 xl:grid-cols-2">
            {/* BUDGET */}
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Budget Progress
                  </h2>

                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    See how your spending compares with planned budgets.
                  </p>
                </div>

                <Link
                  to="/budgets"
                  className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 dark:border-blue-900 dark:bg-slate-800 dark:text-blue-400 dark:hover:bg-slate-700"
                >
                  Manage Budgets
                </Link>
              </div>

              {budgets.length === 0 ? (
                <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  No budget data available. Create a budget to view progress
                  here.
                </div>
              ) : (
                <div className="space-y-4">
                  {budgets.map((budget, index) => {
                    const spent = Number(budget.total_spent || 0);
                    const limit = Number(budget.monthly_limit || 0);

                    const percentage =
                      limit > 0
                        ? Math.min((spent / limit) * 100, 100)
                        : 0;

                    return (
                      <div
                        key={`${budget.category}-${index}`}
                        className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                              {budget.category}
                            </p>

                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                              Spent GH₵ {spent.toFixed(2)} of GH₵{' '}
                              {limit.toFixed(2)}
                            </p>
                          </div>

                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-400">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>

                        <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SAVINGS */}
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Savings Overview
                  </h2>

                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Review your savings goals, targets, and remaining balance.
                  </p>
                </div>

                <Link
                  to="/savings"
                  className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-900 dark:bg-slate-800 dark:text-emerald-400 dark:hover:bg-slate-700"
                >
                  View Savings
                </Link>
              </div>

              {numberOfGoals === 0 ? (
                <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  No savings goals found. Add a goal to see progress here.
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="rounded-[1.5rem] bg-slate-50 p-5 dark:bg-slate-800">
                    <div className="flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
                      <span>Overall Progress</span>
                      <span>{savingsPercentage.toFixed(0)}%</span>
                    </div>

                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className="h-full rounded-full bg-emerald-600"
                        style={{ width: `${savingsPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[1.5rem] bg-emerald-50 p-5 dark:bg-slate-800">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
                        Total Saved
                      </p>

                      <p className="mt-3 text-2xl font-semibold text-emerald-900 dark:text-emerald-300">
                        GH₵ {totalSaved.toFixed(2)}
                      </p>
                    </div>

                    <div className="rounded-[1.5rem] bg-sky-50 p-5 dark:bg-slate-800">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-400">
                        Target
                      </p>

                      <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                        GH₵ {totalTarget.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[1.5rem] bg-slate-50 p-5 dark:bg-slate-800">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Remaining to Save
                      </p>

                      <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">
                        GH₵ {remainingToSave.toFixed(2)}
                      </p>
                    </div>

                    <div className="rounded-[1.5rem] bg-slate-50 p-5 dark:bg-slate-800">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Savings Goals
                      </p>

                      <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">
                        {numberOfGoals}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* RECENT TRANSACTIONS */}
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Recent Transactions
                </h2>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  A quick look at the latest income and expense entries.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/transactions"
                  className="inline-flex items-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  View All
                </Link>

                <Link
                  to="/reports"
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  View Reports
                </Link>
              </div>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="rounded-[1.5rem] bg-slate-50 p-6 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                No recent transactions available. Add activity to populate
                this list.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                        Date
                      </th>

                      <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                        Type
                      </th>

                      <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                        Category
                      </th>

                      <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                        Description
                      </th>

                      <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                        Amount
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {recentTransactions.map((transaction) => {
                      const isIncome = transaction.type === 'income';

                      return (
                        <tr
                          key={transaction.id}
                          className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800"
                        >
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                            {transaction.transaction_date}
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                isIncome
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                                  : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                              }`}
                            >
                              {transaction.type}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                            {transaction.category}
                          </td>

                          <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                            {transaction.description || '-'}
                          </td>

                          <td
                            className={`px-4 py-3 font-semibold ${
                              isIncome
                                ? 'text-emerald-600'
                                : 'text-red-600'
                            }`}
                          >
                            {isIncome ? '+' : '-'}GH₵{' '}
                            {Number(transaction.amount || 0).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* FINAL STATS */}
          <section className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Total Transactions
              </p>

              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {Number(
                  monthly.total_transactions || transactions.length || 0
                )}
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Budget Categories
              </p>

              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {budgets.length}
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Savings Goals
              </p>

              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {numberOfGoals}
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default Dashboard;