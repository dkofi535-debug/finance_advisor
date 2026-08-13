import React, { useEffect, useState } from 'react';
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetOptimization,
} from '../services/budgetService';

const initialFormData = {
  category: '',
  monthly_limit: '',
  month: '',
  year: '',
};

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [optimization, setOptimization] = useState(null);
  const [optimizationMonth, setOptimizationMonth] = useState(new Date().getMonth() + 1);
  const [optimizationYear, setOptimizationYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadBudgets();
    loadOptimization(new Date().getMonth() + 1, new Date().getFullYear());
  }, []);

  const loadBudgets = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getBudgets();
      setBudgets(response?.budgets || []);
    } catch (err) {
      console.error('Load budgets error:', err);
      setError('Failed to load budgets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.category.trim()) {
      setError('Category is required.');
      return false;
    }

    const monthlyLimit = Number(formData.monthly_limit);

    if (!Number.isFinite(monthlyLimit) || monthlyLimit <= 0) {
      setError('Monthly limit must be greater than 0.');
      return false;
    }

    const month = Number(formData.month);

    if (!Number.isInteger(month) || month < 1 || month > 12) {
      setError('Month must be between 1 and 12.');
      return false;
    }

    const year = Number(formData.year);

    if (!Number.isInteger(year) || String(year).length !== 4) {
      setError('Year must be a valid four-digit value.');
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = {
        category: formData.category.trim(),
        monthly_limit: Number(formData.monthly_limit),
        month: Number(formData.month),
        year: Number(formData.year),
      };

      if (editingId) {
        await updateBudget(editingId, payload);
      } else {
        await createBudget(payload);
      }

      await loadBudgets();
      resetForm();
    } catch (err) {
      console.error('Save budget error:', err);
      setError('Failed to save budget. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (budget) => {
    setEditingId(budget.id);

    setFormData({
      category: budget.category || '',
      monthly_limit: budget.monthly_limit ?? '',
      month: budget.month ?? '',
      year: budget.year ?? '',
    });

    setError('');
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this budget?'
    );

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      await deleteBudget(id);
      await loadBudgets();

      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      console.error('Delete budget error:', err);
      setError('Failed to delete budget. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const loadOptimization = async (month = optimizationMonth, year = optimizationYear) => {
    try {
      const response = await getBudgetOptimization(month, year);
      setOptimization(response || null);
    } catch (err) {
      console.error('Budget optimization error:', err);
      setError('Unable to generate budget optimization right now.');
    }
  };

  return (
    <div className="space-y-8">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-slate-100">
          Budgets
        </h1>

        <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
          Create and manage your monthly budgets.
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {/* BUDGET FORM */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-slate-100">
          {editingId ? 'Edit Budget' : 'Budget Details'}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 lg:grid-cols-2"
        >
          {/* CATEGORY */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Category
            </label>

            <input
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
              placeholder="e.g. Groceries"
            />
          </div>

          {/* MONTHLY LIMIT */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Monthly Limit
            </label>

            <input
              name="monthly_limit"
              type="number"
              step="0.01"
              min="0"
              value={formData.monthly_limit}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
              placeholder="0.00"
            />
          </div>

          {/* MONTH */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Month
            </label>

            <input
              name="month"
              type="number"
              min="1"
              max="12"
              value={formData.month}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
              placeholder="1-12"
            />
          </div>

          {/* YEAR */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Year
            </label>

            <input
              name="year"
              type="number"
              value={formData.year}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
              placeholder="2026"
            />
          </div>

          {/* BUTTONS */}
          <div className="flex flex-wrap gap-3 lg:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? 'Saving...'
                : editingId
                ? 'Update Budget'
                : 'Create Budget'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* BUDGET OPTIMIZATION */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
              Budget Optimization
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
              Optimization Algorithm: evaluates the current budget and recommends an improved allocation.
            </p>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
          <input
            type="number"
            min="1"
            max="12"
            value={optimizationMonth}
            onChange={(event) => setOptimizationMonth(Number(event.target.value))}
            className="w-28 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
          />

          <input
            type="number"
            value={optimizationYear}
            onChange={(event) => setOptimizationYear(Number(event.target.value))}
            className="w-32 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
          />

          <button
            type="button"
            onClick={() => loadOptimization(optimizationMonth, optimizationYear)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Optimize Budget
          </button>
        </div>

        {optimization && (
          <div className="space-y-3">
            <div className="rounded-lg bg-indigo-50 p-3 text-sm text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Income: GH₵ {Number(optimization.totalIncome || 0).toFixed(2)}
              <span className="ml-4">Expenses: GH₵ {Number(optimization.totalExpenses || 0).toFixed(2)}</span>
              <span className="ml-4">Available: GH₵ {Number(optimization.disposableIncome || 0).toFixed(2)}</span>
            </div>

            {optimization.recommendations.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-gray-900 dark:text-slate-100">{item.category}</span>
                  <span className="text-xs text-gray-600 dark:text-slate-400">
                    {item.difference >= 0 ? 'Increase' : 'Reduce'}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-700 dark:text-slate-300">
                  Current: GH₵ {Number(item.current || 0).toFixed(2)}
                  <span className="mx-2">→</span>
                  Recommended: GH₵ {Number(item.recommended || 0).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BUDGET OVERVIEW */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
            Budget Overview
          </h2>

          {loading && (
            <span className="text-sm text-gray-500 dark:text-slate-400">
              Loading...
            </span>
          )}
        </div>

        {budgets.length === 0 && !loading ? (
          <p className="text-sm text-gray-500 dark:text-slate-400">
            No budgets found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-slate-300">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-slate-300">
                    Limit
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-slate-300">
                    Month
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-slate-300">
                    Year
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-slate-300">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {budgets.map((budget) => (
                  <tr
                    key={budget.id}
                    className="bg-white hover:bg-gray-50 dark:bg-slate-900 dark:hover:bg-slate-800"
                  >
                    <td className="px-4 py-3 text-gray-700 dark:text-slate-300">
                      {budget.category}
                    </td>

                    <td className="px-4 py-3 text-gray-700 dark:text-slate-300">
                      GH₵ {Number(budget.monthly_limit).toFixed(2)}
                    </td>

                    <td className="px-4 py-3 text-gray-700 dark:text-slate-300">
                      {budget.month}
                    </td>

                    <td className="px-4 py-3 text-gray-700 dark:text-slate-300">
                      {budget.year}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(budget)}
                          disabled={saving}
                          className="rounded bg-yellow-500 px-3 py-1 text-sm font-semibold text-white hover:bg-yellow-600 disabled:opacity-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(budget.id)}
                          disabled={saving}
                          className="rounded bg-red-600 px-3 py-1 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Budgets;