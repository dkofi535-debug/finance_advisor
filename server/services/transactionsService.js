const supabase = require('../config/supabase');

const transactionSelectFields = 'id, user_id, type, category, amount, description, transaction_date, created_at';

const createTransaction = async ({ userId, type, category, amount, description, transaction_date }) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([
      {
        user_id: userId,
        type,
        category,
        amount,
        description,
        transaction_date,
      },
    ])
    .select(transactionSelectFields)
    .single();

  if (error) {
    const dbError = new Error(`Failed to create transaction: ${error.message}`);
    dbError.statusCode = 500;
    throw dbError;
  }

  return data;
};

const getTransactions = async (userId) => {
  const { data, error } = await supabase
    .from('transactions')
    .select(transactionSelectFields)
    .eq('user_id', userId)
    .order('transaction_date', { ascending: false });

  if (error) {
    const dbError = new Error(`Failed to fetch transactions: ${error.message}`);
    dbError.statusCode = 500;
    throw dbError;
  }

  return data || [];
};

const getTransactionById = async (userId, transactionId) => {
  const { data, error } = await supabase
    .from('transactions')
    .select(transactionSelectFields)
    .eq('id', transactionId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    const dbError = new Error(`Failed to fetch transaction: ${error.message}`);
    dbError.statusCode = 500;
    throw dbError;
  }

  if (!data) {
    const notFoundError = new Error('Transaction not found');
    notFoundError.statusCode = 404;
    throw notFoundError;
  }

  return data;
};

const updateTransaction = async (userId, transactionId, updates) => {
  const existing = await getTransactionById(userId, transactionId);

  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', transactionId)
    .eq('user_id', userId)
    .select(transactionSelectFields)
    .single();

  if (error) {
    const dbError = new Error(`Failed to update transaction: ${error.message}`);
    dbError.statusCode = 500;
    throw dbError;
  }

  return data;
};

const deleteTransaction = async (userId, transactionId) => {
  await getTransactionById(userId, transactionId);

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', transactionId)
    .eq('user_id', userId);

  if (error) {
    const dbError = new Error(`Failed to delete transaction: ${error.message}`);
    dbError.statusCode = 500;
    throw dbError;
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
};
