import { useEffect, useState } from 'react';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  searchTransactions,
} from '../services/transactionService';

const initialFormData = {
  type: 'income',
  category: '',
  amount: '',
  description: '',
  transaction_date: '',
};

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchFilters, setSearchFilters] = useState({
    category: '',
    type: '',
    amount: '',
    date: '',
    description: '',
  });
  const [searchResults, setSearchResults] = useState([]);
  const [searchMode, setSearchMode] = useState(false);
  const [searching, setSearching] = useState(false);

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
      console.error('Load transactions error:', err);
      setError('Could not load transactions right now.');
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

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setError('');
  };

  const handleSearchChange = (event) => {
    const { name, value } = event.target;

    setSearchFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = async (event) => {
    event.preventDefault();

    try {
      setSearching(true);
      setError('');

      const cleanedFilters = Object.fromEntries(
        Object.entries(searchFilters).filter(
          ([, value]) => value !== '' && value !== null && value !== undefined
        )
      );

      if (Object.keys(cleanedFilters).length === 0) {
        setSearchMode(false);
        setSearchResults([]);
        return;
      }

      const response = await searchTransactions(cleanedFilters);
      setSearchResults(response?.transactions || []);
      setSearchMode(true);
    } catch (err) {
      console.error('Search transactions error:', err);
      setError('Unable to search transactions right now.');
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchFilters({
      category: '',
      type: '',
      amount: '',
      date: '',
      description: '',
    });
    setSearchResults([]);
    setSearchMode(false);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !formData.category.trim() ||
      !formData.amount ||
      !formData.description.trim() ||
      !formData.transaction_date
    ) {
      setError('Please fill in all fields before saving.');
      return;
    }

    const amountValue = Number(formData.amount);

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setError('Amount must be a positive number.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccessMessage('');

      const payload = {
        type: formData.type,
        category: formData.category.trim(),
        amount: amountValue,
        description: formData.description.trim(),
        transaction_date: formData.transaction_date,
      };

      if (editingId) {
        await updateTransaction(editingId, payload);
        setSuccessMessage('Transaction updated successfully.');
      } else {
        await createTransaction(payload);
        setSuccessMessage('Transaction added successfully.');
      }

      await loadTransactions();
      resetForm();
    } catch (err) {
      console.error('Save transaction error:', err);

      /*
       * Keep the backend error visible while debugging.
       * This will help us identify the exact cause of a 500.
       */
      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error;

      setError(
        backendMessage ||
          'Unable to save the transaction. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (transaction) => {
    setFormData({
      type: transaction.type || 'income',
      category: transaction.category || '',
      amount: transaction.amount ?? '',
      description: transaction.description || '',
      transaction_date: transaction.transaction_date || '',
    });

    setEditingId(transaction.id);
    setError('');
    setSuccessMessage('');
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this transaction?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');
      setSuccessMessage('');

      await deleteTransaction(id);
      await loadTransactions();

      setSuccessMessage('Transaction deleted successfully.');

      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      console.error('Delete transaction error:', err);

      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error;

      setError(
        backendMessage ||
          'Unable to delete the transaction.'
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-slate-100">
          Transactions
        </h1>

        <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
          Manage your income and expenses in a simple, clear view.
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {/* SUCCESS */}
      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300">
          {successMessage}
        </div>
      )}

      {/* FORM */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
            {editingId ? 'Edit Transaction' : 'Add Transaction'}
          </h2>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              Cancel edit
            </button>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 md:grid-cols-2"
        >
          {/* TYPE */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Type
            </label>

            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          {/* CATEGORY */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Category
            </label>

            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
              placeholder="e.g. Salary"
            />
          </div>

          {/* AMOUNT */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Amount
            </label>

            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>

          {/* DATE */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Transaction Date
            </label>

            <input
              type="date"
              name="transaction_date"
              value={formData.transaction_date}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* DESCRIPTION */}
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
              placeholder="Write a short note"
            />
          </div>

          {/* BUTTON */}
          <div className="flex flex-wrap gap-3 md:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {submitting
                ? 'Saving...'
                : editingId
                ? 'Update Transaction'
                : 'Save Transaction'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* SEARCH ALGORITHM */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
              Transaction Search
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
              Search Algorithm: searches through transactions to find matching records.
            </p>
          </div>

          {searchMode && (
            <button
              type="button"
              onClick={clearSearch}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Clear search
            </button>
          )}
        </div>

        <form onSubmit={handleSearch} className="grid gap-4 md:grid-cols-5">
          <input
            type="text"
            name="category"
            value={searchFilters.category}
            onChange={handleSearchChange}
            placeholder="Category"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
          />

          <select
            name="type"
            value={searchFilters.type}
            onChange={handleSearchChange}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="">Type</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <input
            type="number"
            name="amount"
            value={searchFilters.amount}
            onChange={handleSearchChange}
            placeholder="Amount"
            min="0"
            step="0.01"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
          />

          <input
            type="date"
            name="date"
            value={searchFilters.date}
            onChange={handleSearchChange}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />

          <input
            type="text"
            name="description"
            value={searchFilters.description}
            onChange={handleSearchChange}
            placeholder="Description"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
          />

          <div className="md:col-span-5 flex justify-end">
            <button
              type="submit"
              disabled={searching}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {searching ? 'Searching...' : 'Search Transactions'}
            </button>
          </div>
        </form>
      </div>

      {/* TRANSACTIONS TABLE */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-slate-100">
          {searchMode ? 'Search Results' : 'All Transactions'}
        </h2>

        {loading ? (
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Loading transactions...
          </p>
        ) : (searchMode ? searchResults : transactions).length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-slate-400">
            No transactions matched your search.
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
                    Description
                  </th>

                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-slate-300">
                    Amount
                  </th>

                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-slate-300">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {(searchMode ? searchResults : transactions).map((transaction) => {
                  const isIncome = transaction.type === 'income';

                  return (
                    <tr
                      key={transaction.id}
                      className="bg-white hover:bg-gray-50 dark:bg-slate-900 dark:hover:bg-slate-800"
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

                      <td className="px-4 py-3 text-gray-700 dark:text-slate-300">
                        {transaction.description}
                      </td>

                      <td
                        className={`px-4 py-3 font-semibold ${
                          isIncome
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {isIncome ? '+' : '-'}GH₵{' '}
                        {Number(transaction.amount || 0).toFixed(2)}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(transaction)}
                            disabled={submitting}
                            className="rounded bg-yellow-500 px-3 py-1 text-sm font-medium text-white hover:bg-yellow-600 disabled:opacity-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(transaction.id)
                            }
                            disabled={submitting}
                            className="rounded bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
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

export default Transactions;