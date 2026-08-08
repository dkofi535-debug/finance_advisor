import React, { useEffect, useState } from 'react';
import {
  getSavings,
  createSavings,
  updateSavings,
  deleteSavings,
} from '../services/savingsService';

const initialFormData = {
  goal_name: '',
  target_amount: '',
  current_amount: '',
  target_date: '',
};

const Savings = () => {
  const [goals, setGoals] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await getSavings();

      setGoals(response?.data || []);
    } catch (err) {
      console.error(err);
      setError('Could not load savings goals right now.');
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
    if (!formData.goal_name.trim()) {
      setError('Goal name is required.');
      return false;
    }

    const targetAmount = Number(formData.target_amount);

    if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
      setError('Target amount must be greater than 0.');
      return false;
    }

    const currentAmount =
      formData.current_amount === ''
        ? 0
        : Number(formData.current_amount);

    if (!Number.isFinite(currentAmount) || currentAmount < 0) {
      setError('Current amount cannot be negative.');
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
    setSuccessMessage('');

    try {
      const payload = {
        goal_name: formData.goal_name.trim(),
        target_amount: Number(formData.target_amount),
        current_amount:
          formData.current_amount === ''
            ? 0
            : Number(formData.current_amount),
        target_date: formData.target_date || null,
      };

      if (editingId) {
        await updateSavings(editingId, payload);
        setSuccessMessage('Savings goal updated successfully.');
      } else {
        await createSavings(payload);
        setSuccessMessage('Savings goal created successfully.');
      }

      await loadGoals();
      resetForm();
    } catch (err) {
      console.error(err);
      setError('Unable to save the savings goal. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (goal) => {
    setEditingId(goal.id);

    setFormData({
      goal_name: goal.goal_name || '',
      target_amount: goal.target_amount ?? '',
      current_amount: goal.current_amount ?? '',
      target_date: goal.target_date || '',
    });

    setError('');
    setSuccessMessage('');
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this savings goal?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');

      await deleteSavings(id);
      await loadGoals();

      setSuccessMessage('Savings goal deleted successfully.');

      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      console.error(err);
      setError('Unable to delete the savings goal.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">

      {/* PAGE HEADER */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">
          Savings Goals
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Create and manage your savings goals and track your progress.
        </p>
      </div>

      {/* MESSAGES */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {/* FORM */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingId ? 'Edit Savings Goal' : 'Create Savings Goal'}
          </h2>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Cancel edit
            </button>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 md:grid-cols-2"
        >

          {/* GOAL NAME */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Goal Name
            </label>

            <input
              type="text"
              name="goal_name"
              value={formData.goal_name}
              onChange={handleChange}
              placeholder="e.g. New Laptop"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* TARGET AMOUNT */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Target Amount
            </label>

            <input
              type="number"
              name="target_amount"
              value={formData.target_amount}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* CURRENT AMOUNT */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Current Amount
            </label>

            <input
              type="number"
              name="current_amount"
              value={formData.current_amount}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* TARGET DATE */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Target Date
            </label>

            <input
              type="date"
              name="target_date"
              value={formData.target_date}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* BUTTONS */}
          <div className="flex flex-wrap gap-3 md:col-span-2">

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {saving
                ? 'Saving...'
                : editingId
                  ? 'Update Goal'
                  : 'Create Goal'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            )}

          </div>
        </form>
      </div>

      {/* SAVINGS GOALS */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Your Savings Goals
          </h2>

          {loading && (
            <span className="text-sm text-gray-500">
              Loading...
            </span>
          )}
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">
            Loading savings goals...
          </p>
        ) : goals.length === 0 ? (
          <p className="text-sm text-gray-500">
            No savings goals found. Create your first goal above.
          </p>
        ) : (
          <div className="overflow-x-auto">

            <table className="min-w-full divide-y divide-gray-200 text-sm">

              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Goal
                  </th>

                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Target
                  </th>

                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Saved
                  </th>

                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Progress
                  </th>

                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Target Date
                  </th>

                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">

                {goals.map((goal) => {
                  const target = Number(goal.target_amount || 0);
                  const saved = Number(goal.current_amount || 0);

                  const percentage =
                    target > 0
                      ? Math.min((saved / target) * 100, 100)
                      : 0;

                  return (
                    <tr
                      key={goal.id}
                      className="hover:bg-gray-50"
                    >

                      <td className="px-4 py-4 font-medium text-gray-900">
                        {goal.goal_name}
                      </td>

                      <td className="px-4 py-4 text-gray-700">
                        GH₵ {target.toFixed(2)}
                      </td>

                      <td className="px-4 py-4 text-gray-700">
                        GH₵ {saved.toFixed(2)}
                      </td>

                      <td className="px-4 py-4 min-w-[180px]">

                        <div className="mb-1 flex justify-between text-xs font-medium text-gray-600">
                          <span>Progress</span>
                          <span>{percentage.toFixed(0)}%</span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-emerald-600"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>

                      </td>

                      <td className="px-4 py-4 text-gray-700">
                        {goal.target_date || '-'}
                      </td>

                      <td className="px-4 py-4">

                        <div className="flex flex-wrap gap-2">

                          <button
                            type="button"
                            onClick={() => handleEdit(goal)}
                            disabled={saving}
                            className="rounded bg-yellow-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-yellow-600 disabled:opacity-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(goal.id)}
                            disabled={saving}
                            className="rounded bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            Delete
                          </button>

                        </div>

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

export default Savings;