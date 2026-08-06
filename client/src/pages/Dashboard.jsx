import { useEffect, useState } from "react";
import { getDashboard } from "../services/dashboardService";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const response = await getDashboard();
      setDashboard(response.dashboard);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <h2 className="text-center mt-10 text-lg text-gray-600">Loading...</h2>;
  }

  const recentTransactions = dashboard?.recent_transactions || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Finance Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">A quick view of your income, expenses, and latest activity.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-green-700">Total Income</p>
          <p className="mt-3 text-3xl font-semibold text-green-800">GH₵ {dashboard.total_income}</p>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-red-700">Total Expenses</p>
          <p className="mt-3 text-3xl font-semibold text-red-800">GH₵ {dashboard.total_expenses}</p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-blue-700">Current Balance</p>
          <p className="mt-3 text-3xl font-semibold text-blue-800">GH₵ {dashboard.current_balance}</p>
        </div>

        <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-purple-700">Total Transactions</p>
          <p className="mt-3 text-3xl font-semibold text-purple-800">{dashboard.total_transactions}</p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
        </div>

        {recentTransactions.length === 0 ? (
          <p className="text-sm text-gray-500">No recent transactions found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Category</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Description</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Type</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {recentTransactions.map((transaction) => {
                  const isIncome = transaction.type === "income";

                  return (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700">{transaction.transaction_date}</td>
                      <td className="px-4 py-3 text-gray-700">{transaction.category}</td>
                      <td className="px-4 py-3 text-gray-700">{transaction.description}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isIncome ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className={`px-4 py-3 font-semibold ${isIncome ? "text-green-600" : "text-red-600"}`}>
                        {isIncome ? "+" : "-"}GH₵ {Number(transaction.amount).toFixed(2)}
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
}

export default Dashboard;