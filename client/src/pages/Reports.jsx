import React, { useEffect, useState } from 'react';
import {
  getMonthlyReport,
  getCategoryReport,
  getBudgetReport,
  getSavingsReport,
} from '../services/reportsService';

const Reports = () => {
  const [monthly, setMonthly] = useState(null);
  const [category, setCategory] = useState([]);
  const [budget, setBudget] = useState([]);
  const [savings, setSavings] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const monthlyRes = await getMonthlyReport();
      const categoryRes = await getCategoryReport();
      const budgetRes = await getBudgetReport();
      const savingsRes = await getSavingsReport();

      setMonthly(monthlyRes.data);
      setCategory(categoryRes.data);
      setBudget(budgetRes.data);
      setSavings(savingsRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-8 p-6">

      <h1 className="text-3xl font-bold">
        Financial Reports
      </h1>

      {monthly && (
        <div className="grid md:grid-cols-4 gap-4">

          <div className="bg-green-100 rounded-lg p-5">
            <h3>Total Income</h3>
            <p className="text-2xl font-bold">
              GH₵ {monthly.total_income}
            </p>
          </div>

          <div className="bg-red-100 rounded-lg p-5">
            <h3>Total Expenses</h3>
            <p className="text-2xl font-bold">
              GH₵ {monthly.total_expenses}
            </p>
          </div>

          <div className="bg-blue-100 rounded-lg p-5">
            <h3>Balance</h3>
            <p className="text-2xl font-bold">
              GH₵ {monthly.net_balance}
            </p>
          </div>

          <div className="bg-yellow-100 rounded-lg p-5">
            <h3>Transactions</h3>
            <p className="text-2xl font-bold">
              {monthly.total_transactions}
            </p>
          </div>

        </div>
      )}

      <div className="bg-white rounded-xl shadow p-6">

        <h2 className="text-xl font-semibold mb-4">
          Expenses by Category
        </h2>

        <table className="w-full">

          <thead>

            <tr>

              <th className="text-left">Category</th>

              <th className="text-left">Total</th>

            </tr>

          </thead>

          <tbody>

            {category.map((item) => (

              <tr key={item.category}>

                <td>{item.category}</td>

                <td>GH₵ {item.total_expenses}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      <div className="bg-white rounded-xl shadow p-6">

        <h2 className="text-xl font-semibold mb-4">
          Budget Report
        </h2>

        <table className="w-full">

          <thead>

            <tr>

              <th>Category</th>

              <th>Budget</th>

              <th>Spent</th>

              <th>Remaining</th>

            </tr>

          </thead>

          <tbody>

            {budget.map((item) => (

              <tr key={item.category}>

                <td>{item.category}</td>

                <td>{item.monthly_limit}</td>

                <td>{item.total_spent}</td>

                <td>{item.remaining_budget}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {savings && (

        <div className="grid md:grid-cols-4 gap-4">

          <div className="bg-indigo-100 rounded-lg p-5">
            <h3>Target</h3>
            <p>GH₵ {savings.total_target_amount}</p>
          </div>

          <div className="bg-green-100 rounded-lg p-5">
            <h3>Saved</h3>
            <p>GH₵ {savings.total_saved}</p>
          </div>

          <div className="bg-red-100 rounded-lg p-5">
            <h3>Remaining</h3>
            <p>GH₵ {savings.remaining_to_save}</p>
          </div>

          <div className="bg-gray-100 rounded-lg p-5">
            <h3>Goals</h3>
            <p>{savings.number_of_goals}</p>
          </div>

        </div>

      )}

    </div>
  );
};

export default Reports;