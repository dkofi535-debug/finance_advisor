import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardData } from "../services/dashboardService";

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getDashboardData();

      console.log("Dashboard data:", response);

      setData(response);
    } catch (err) {
      console.error("Dashboard error:", err);

      setError(
        "Unable to load dashboard data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // DATA FROM BACKEND
  // ==============================

  const monthly = data?.monthly || {};

  const budgets = Array.isArray(data?.budgets)
    ? data.budgets
    : [];

  const savings = data?.savings || {};

  const transactions = Array.isArray(data?.transactions)
    ? data.transactions
    : [];

  const recentTransactions = transactions.slice(0, 5);

  // ==============================
  // SAVINGS CALCULATION
  // ==============================

  const totalSaved = Number(
    savings.total_saved || 0
  );

  const totalTarget = Number(
    savings.total_target_amount || 0
  );

  const remainingToSave = Number(
    savings.remaining_to_save || 0
  );

  const numberOfGoals = Number(
    savings.number_of_goals || 0
  );

  const savingsPercentage =
    totalTarget > 0
      ? Math.min(
          (totalSaved / totalTarget) * 100,
          100
        )
      : 0;

  // ==============================
  // RENDER
  // ==============================

  return (
    <div className="p-4 sm:p-6 lg:p-8">

      {/* ==================================
          HEADER
      ================================== */}

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Finance Dashboard
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            Track your cash flow, budgets, and savings
            progress in one place.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">

          <Link
            to="/transactions"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Transactions
          </Link>

          <Link
            to="/budgets"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            Budgets
          </Link>

          <Link
            to="/savings"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            Savings
          </Link>

        </div>
      </div>


      {/* ==================================
          LOADING
      ================================== */}

      {loading && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
          Loading dashboard metrics...
        </div>
      )}


      {/* ==================================
          ERROR
      ================================== */}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">

          <p>{error}</p>

          <button
            onClick={loadDashboard}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Try Again
          </button>

        </div>
      )}


      {/* ==================================
          DASHBOARD
      ================================== */}

      {!loading && !error && (
        <>

          {/* ==================================
              FINANCIAL SUMMARY
          ================================== */}

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">

            {/* TOTAL INCOME */}

            <div className="rounded-2xl border border-green-200 bg-green-50 p-6 shadow-sm">

              <p className="text-sm font-medium uppercase tracking-wide text-green-700">
                Total Income
              </p>

              <p className="mt-3 text-3xl font-semibold text-green-800">
                GH₵{" "}
                {Number(
                  monthly.total_income || 0
                ).toFixed(2)}
              </p>

            </div>


            {/* TOTAL EXPENSES */}

            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">

              <p className="text-sm font-medium uppercase tracking-wide text-red-700">
                Total Expenses
              </p>

              <p className="mt-3 text-3xl font-semibold text-red-800">
                GH₵{" "}
                {Number(
                  monthly.total_expenses || 0
                ).toFixed(2)}
              </p>

            </div>


            {/* NET BALANCE */}

            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-sm">

              <p className="text-sm font-medium uppercase tracking-wide text-blue-700">
                Net Balance
              </p>

              <p className="mt-3 text-3xl font-semibold text-blue-800">
                GH₵{" "}
                {Number(
                  monthly.net_balance || 0
                ).toFixed(2)}
              </p>

            </div>


            {/* TOTAL SAVINGS */}

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">

              <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
                Total Savings
              </p>

              <p className="mt-3 text-3xl font-semibold text-emerald-800">
                GH₵{" "}
                {totalSaved.toFixed(2)}
              </p>

            </div>

          </div>


          {/* ==================================
              BUDGET + SAVINGS
          ================================== */}

          <div className="mt-8 grid gap-6 xl:grid-cols-2">


            {/* ==================================
                BUDGET PROGRESS
            ================================== */}

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

              <div className="mb-4 flex items-center justify-between">

                <h2 className="text-lg font-semibold text-gray-900">
                  Budget Progress
                </h2>

                <Link
                  to="/budgets"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  View Budgets
                </Link>

              </div>


              {budgets.length === 0 ? (

                <div className="rounded-lg bg-gray-50 p-4">

                  <p className="text-sm text-gray-500">
                    No budget data available.
                  </p>

                  <Link
                    to="/budgets"
                    className="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Create a budget →
                  </Link>

                </div>

              ) : (

                <div className="space-y-5">

                  {budgets.map((budget, index) => {

                    const spent = Number(
                      budget.total_spent || 0
                    );

                    const limit = Number(
                      budget.monthly_limit || 0
                    );

                    const percentage =
                      limit > 0
                        ? Math.min(
                            (spent / limit) * 100,
                            100
                          )
                        : 0;

                    return (
                      <div
                        key={`${budget.category}-${index}`}
                        className="space-y-2"
                      >

                        <div className="flex items-center justify-between text-sm font-medium text-gray-700">

                          <span>
                            {budget.category}
                          </span>

                          <span>
                            {percentage.toFixed(0)}%
                          </span>

                        </div>


                        <div className="h-2 overflow-hidden rounded-full bg-gray-100">

                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />

                        </div>


                        <p className="text-xs text-gray-500">

                          Spent GH₵{" "}
                          {spent.toFixed(2)}

                          {" "}of{" "}

                          GH₵{" "}
                          {limit.toFixed(2)}

                        </p>

                      </div>
                    );
                  })}

                </div>

              )}

            </div>


            {/* ==================================
                SAVINGS OVERVIEW
            ================================== */}

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

              <div className="mb-4 flex items-center justify-between">

                <h2 className="text-lg font-semibold text-gray-900">
                  Savings Overview
                </h2>

                <Link
                  to="/savings"
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  View Savings
                </Link>

              </div>


              {numberOfGoals === 0 ? (

                <div className="rounded-lg bg-gray-50 p-4">

                  <p className="text-sm text-gray-500">
                    No savings goals found.
                  </p>

                  <Link
                    to="/savings"
                    className="mt-2 inline-block text-sm font-medium text-emerald-600 hover:text-emerald-700"
                  >
                    Create a savings goal →
                  </Link>

                </div>

              ) : (

                <div className="space-y-5">

                  {/* PROGRESS */}

                  <div>

                    <div className="flex items-center justify-between text-sm font-medium text-gray-700">

                      <span>
                        Overall Progress
                      </span>

                      <span>
                        {savingsPercentage.toFixed(0)}%
                      </span>

                    </div>


                    <div className="mt-2 h-3 overflow-hidden rounded-full bg-gray-100">

                      <div
                        className="h-full rounded-full bg-emerald-600"
                        style={{
                          width: `${savingsPercentage}%`,
                        }}
                      />

                    </div>

                  </div>


                  {/* SAVED AND TARGET */}

                  <div className="grid grid-cols-2 gap-4">

                    <div className="rounded-lg bg-emerald-50 p-4">

                      <p className="text-xs text-emerald-700">
                        Total Saved
                      </p>

                      <p className="mt-1 text-lg font-semibold text-emerald-800">
                        GH₵{" "}
                        {totalSaved.toFixed(2)}
                      </p>

                    </div>


                    <div className="rounded-lg bg-blue-50 p-4">

                      <p className="text-xs text-blue-700">
                        Target
                      </p>

                      <p className="mt-1 text-lg font-semibold text-blue-800">
                        GH₵{" "}
                        {totalTarget.toFixed(2)}
                      </p>

                    </div>

                  </div>


                  {/* REMAINING */}

                  <div className="rounded-lg bg-gray-50 p-4">

                    <p className="text-xs text-gray-500">
                      Remaining to Save
                    </p>

                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      GH₵{" "}
                      {remainingToSave.toFixed(2)}
                    </p>

                  </div>


                  {/* NUMBER OF GOALS */}

                  <p className="text-xs text-gray-500">

                    {numberOfGoals} savings goal
                    {numberOfGoals === 1
                      ? ""
                      : "s"}

                  </p>

                </div>

              )}

            </div>

          </div>


          {/* ==================================
              RECENT TRANSACTIONS
          ================================== */}

          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="mb-4 flex items-center justify-between">

              <h2 className="text-lg font-semibold text-gray-900">
                Recent Transactions
              </h2>

              <Link
                to="/transactions"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View All
              </Link>

            </div>


            {recentTransactions.length === 0 ? (

              <div className="rounded-lg bg-gray-50 p-4">

                <p className="text-sm text-gray-500">
                  No recent transactions available.
                </p>

                <Link
                  to="/transactions"
                  className="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Add a transaction →
                </Link>

              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="min-w-full divide-y divide-gray-200 text-sm">

                  <thead className="bg-gray-50">

                    <tr>

                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                        Date
                      </th>

                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                        Type
                      </th>

                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                        Category
                      </th>

                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                        Description
                      </th>

                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                        Amount
                      </th>

                    </tr>

                  </thead>


                  <tbody className="divide-y divide-gray-100 bg-white">

                    {recentTransactions.map(
                      (transaction) => {

                        const isIncome =
                          transaction.type ===
                          "income";

                        return (

                          <tr
                            key={transaction.id}
                            className="hover:bg-gray-50"
                          >

                            {/* DATE */}

                            <td className="px-4 py-3 text-gray-700">
                              {transaction.transaction_date}
                            </td>


                            {/* TYPE */}

                            <td className="px-4 py-3">

                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  isIncome
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {transaction.type}
                              </span>

                            </td>


                            {/* CATEGORY */}

                            <td className="px-4 py-3 text-gray-700">
                              {transaction.category}
                            </td>


                            {/* DESCRIPTION */}

                            <td className="px-4 py-3 text-gray-700">
                              {transaction.description}
                            </td>


                            {/* AMOUNT */}

                            <td
                              className={`px-4 py-3 font-semibold ${
                                isIncome
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >

                              {isIncome
                                ? "+"
                                : "-"}
                              GH₵{" "}
                              {Number(
                                transaction.amount
                              ).toFixed(2)}

                            </td>

                          </tr>

                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>


          {/* ==================================
              FOOTER STATISTICS
          ================================== */}

          <div className="mt-6 grid gap-4 sm:grid-cols-3">

            <div className="rounded-xl border border-gray-200 bg-white p-4">

              <p className="text-xs uppercase tracking-wide text-gray-500">
                Total Transactions
              </p>

              <p className="mt-1 text-xl font-semibold text-gray-900">
                {Number(
                  monthly.total_transactions ||
                  transactions.length ||
                  0
                )}
              </p>

            </div>


            <div className="rounded-xl border border-gray-200 bg-white p-4">

              <p className="text-xs uppercase tracking-wide text-gray-500">
                Budget Categories
              </p>

              <p className="mt-1 text-xl font-semibold text-gray-900">
                {budgets.length}
              </p>

            </div>


            <div className="rounded-xl border border-gray-200 bg-white p-4">

              <p className="text-xs uppercase tracking-wide text-gray-500">
                Savings Goals
              </p>

              <p className="mt-1 text-xl font-semibold text-gray-900">
                {numberOfGoals}
              </p>

            </div>

          </div>

        </>
      )}

    </div>
  );
}

export default Dashboard;