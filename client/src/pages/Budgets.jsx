import React, { useEffect, useState } from 'react';
import { getBudgets, createBudget, updateBudget, deleteBudget } from '../services/budgetService';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [formData, setFormData] = useState({
    category: '',
    monthly_limit: '',
    month: '',
    year: '',
  });
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
      setBudgets(response.budgets || []);
    } catch (err) {
      setError('Failed to load budgets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.category.trim()) {
      setError('Category is required.');
      return false;
    }

    const monthlyLimit = Number(formData.monthly_limit);
    if (!monthlyLimit || monthlyLimit <= 0) {
      setError('Monthly limit must be greater than 0.');
      return false;
    }

    const month = Number(formData.month);
    if (!month || month < 1 || month > 12) {
      setError('Month must be between 1 and 12.');
      return false;
    }

    const year = Number(formData.year);
    if (!year || String(year).length !== 4) {
      setError('Year must be a valid four-digit value.');
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setFormData({ category: '', monthly_limit: '', month: '', year: '' });
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
      if (editingId) {
        await updateBudget(editingId, {
          category: formData.category,
          monthly_limit: Number(formData.monthly_limit),
          month: Number(formData.month),
          year: Number(formData.year),
        });
      } else {
        await createBudget({
          category: formData.category,
          monthly_limit: Number(formData.monthly_limit),
          month: Number(formData.month),
          year: Number(formData.year),
        });
      }

      await loadBudgets();
      resetForm();
    } catch (err) {
      setError('Failed to save budget. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (budget) => {
    setEditingId(budget.id);
    setFormData({
      category: budget.category,
      monthly_limit: budget.monthly_limit,
      month: budget.month,
      year: budget.year,
    });
    setError('');
  };

  const handleDelete = async (id) => {
    setSaving(true);
    setError('');

    try {
      await deleteBudget(id);
      await loadBudgets();
    } catch (err) {
      setError('Failed to delete budget. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Budgets</h1>
        <p className="mt-2 text-sm text-gray-600">Create and manage your monthly budgets.</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Budget Details</h2>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
            <input
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Groceries"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Monthly Limit</label>
            <input
              name="monthly_limit"
              type="number"
              step="0.01"
              value={formData.monthly_limit}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Month</label>
            <input
              name="month"
              type="number"
              value={formData.month}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1-12"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Year</label>
            <input
              name="year"
              type="number"
              value={formData.year}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="2026"
            />
          </div>

          <div className="lg:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {editingId ? 'Update Budget' : 'Create Budget'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="ml-3 rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Budget Overview</h2>
          {loading && <span className="text-sm text-gray-500">Loading...</span>}
        </div>

        {budgets.length === 0 && !loading ? (
          <p className="text-sm text-gray-500">No budgets found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Category</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Limit</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Month</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Year</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {budgets.map((budget) => (
                  <tr key={budget.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">{budget.category}</td>
                    <td className="px-4 py-3 text-gray-700">GH₵ {Number(budget.monthly_limit).toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-700">{budget.month}</td>
                    <td className="px-4 py-3 text-gray-700">{budget.year}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleEdit(budget)}
                          className="rounded bg-yellow-500 px-3 py-1 text-sm font-semibold text-white hover:bg-yellow-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(budget.id)}
                          className="rounded bg-red-600 px-3 py-1 text-sm font-semibold text-white hover:bg-red-700"
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
