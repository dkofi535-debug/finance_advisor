const supabase = require('../config/supabase');

const budgetSelectFields = 'id, user_id, category, monthly_limit, month, year, created_at, updated_at';

const createBudget = async ({ userId, category, monthly_limit, month, year }) => {
  const { data, error } = await supabase
    .from('budgets')
    .insert([
      {
        user_id: userId,
        category,
        monthly_limit,
        month,
        year,
      },
    ])
    .select(budgetSelectFields)
    .single();

  if (error) {
    const dbError = new Error(`Failed to create budget: ${error.message}`);
    dbError.statusCode = 500;
    throw dbError;
  }

  return data;
};

const getBudgets = async (userId) => {
  const { data, error } = await supabase
    .from('budgets')
    .select(budgetSelectFields)
    .eq('user_id', userId)
    .order('year', { ascending: false })
    .order('month', { ascending: false });

  if (error) {
    const dbError = new Error(`Failed to fetch budgets: ${error.message}`);
    dbError.statusCode = 500;
    throw dbError;
  }

  return data || [];
};

const getBudgetById = async (userId, budgetId) => {
  const { data, error } = await supabase
    .from('budgets')
    .select(budgetSelectFields)
    .eq('id', budgetId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    const dbError = new Error(`Failed to fetch budget: ${error.message}`);
    dbError.statusCode = 500;
    throw dbError;
  }

  if (!data) {
    const notFoundError = new Error('Budget not found');
    notFoundError.statusCode = 404;
    throw notFoundError;
  }

  return data;
};

const updateBudget = async (userId, budgetId, updates) => {
  await getBudgetById(userId, budgetId);

  const { data, error } = await supabase
    .from('budgets')
    .update(updates)
    .eq('id', budgetId)
    .eq('user_id', userId)
    .select(budgetSelectFields)
    .single();

  if (error) {
    const dbError = new Error(`Failed to update budget: ${error.message}`);
    dbError.statusCode = 500;
    throw dbError;
  }

  return data;
};

const deleteBudget = async (userId, budgetId) => {
  await getBudgetById(userId, budgetId);

  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', budgetId)
    .eq('user_id', userId);

  if (error) {
    const dbError = new Error(`Failed to delete budget: ${error.message}`);
    dbError.statusCode = 500;
    throw dbError;
  }
};

module.exports = {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
};
