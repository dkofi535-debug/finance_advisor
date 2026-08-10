import React, { useEffect, useState } from 'react';
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
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

  useEffect(() => {
    loadBudgets();
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