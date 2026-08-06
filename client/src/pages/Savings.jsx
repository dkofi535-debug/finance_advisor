import React, { useEffect, useState } from 'react';
import {
  getSavings,
  createSavings,
  updateSavings,
  deleteSavings,
} from '../services/savingsService';

const Savings = () => {
  const [goals, setGoals] = useState([]);
  const [formData, setFormData] = useState({
    goal_name: '',
    target_amount: '',
    current_amount: '',
    target_date: '',
  });

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    setLoading(true);

    try {
      const response = await getSavings();
      setGoals(response.data || []);
    } catch (err) {
      setError('Failed to load savings goals.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      goal_name: '',
      target_amount: '',
      current_amount: '',
      target_date: '',
    });

    setEditingId(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);

    try {
      const payload = {
        ...formData,
        target_amount: Number(formData.target_amount),
        current_amount: Number(formData.current_amount),
      };

      if (editingId) {
        await updateSavings(editingId, payload);
      } else {
        await createSavings(payload);
      }

      await loadGoals();
      resetForm();
    } catch (err) {
      setError('Failed to save savings goal.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (goal) => {
    setEditingId(goal.id);

    setFormData({
      goal_name: goal.goal_name,
      target_amount: goal.target_amount,
      current_amount: goal.current_amount,
      target_date: goal.target_date || '',
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this savings goal?')) return;

    try {
      await deleteSavings(id);
      await loadGoals();
    } catch (err) {
      setError('Failed to delete savings goal.');
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-semibold">Savings Goals</h1>
        <p className="text-gray-600 mt-2">
          Create and manage your savings goals.
        </p>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-xl p-6">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">

          <input
            name="goal_name"
            placeholder="Goal Name"
            value={formData.goal_name}
            onChange={handleChange}
            className="border rounded p-2"
          />

          <input
            name="target_amount"
            type="number"
            placeholder="Target Amount"
            value={formData.target_amount}
            onChange={handleChange}
            className="border rounded p-2"
          />

          <input
            name="current_amount"
            type="number"
            placeholder="Current Amount"
            value={formData.current_amount}
            onChange={handleChange}
            className="border rounded p-2"
          />

          <input
            name="target_date"
            type="date"
            value={formData.target_date}
            onChange={handleChange}
            className="border rounded p-2"
          />

          <div className="md:col-span-2 flex gap-3">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              disabled={saving}
            >
              {editingId ? 'Update Goal' : 'Create Goal'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="border px-4 py-2 rounded"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white shadow rounded-xl p-6">

        {loading ? (
          <p>Loading...</p>
        ) : goals.length === 0 ? (
          <p>No savings goals found.</p>
        ) : (
          <table className="w-full">

            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Goal</th>
                <th className="text-left py-2">Target</th>
                <th className="text-left py-2">Saved</th>
                <th className="text-left py-2">Target Date</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>

            <tbody>

              {goals.map((goal) => (

                <tr key={goal.id} className="border-b">

                  <td>{goal.goal_name}</td>

                  <td>GH₵ {Number(goal.target_amount).toFixed(2)}</td>

                  <td>GH₵ {Number(goal.current_amount).toFixed(2)}</td>

                  <td>{goal.target_date || '-'}</td>

                  <td className="space-x-2">

                    <button
                      onClick={() => handleEdit(goal)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>
        )}

      </div>

    </div>
  );
};

export default Savings;