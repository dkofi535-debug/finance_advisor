const supabase = require('../config/supabase');

const savingsGoalSelectFields = 'id, user_id, goal_name, target_amount, current_amount, target_date, created_at, updated_at';

const createSavingsGoal = async ({ userId, goal_name, target_amount, current_amount, target_date }) => {
  const { data, error } = await supabase
    .from('savings_goals')
    .insert([
      {
        user_id: userId,
        goal_name,
        target_amount,
        current_amount,
        target_date,
      },
    ])
    .select(savingsGoalSelectFields)
    .single();

  if (error) {
    const dbError = new Error(`Failed to create savings goal: ${error.message}`);
    dbError.statusCode = 500;
    throw dbError;
  }

  return data;
};

const getSavingsGoals = async (userId) => {
  const { data, error } = await supabase
    .from('savings_goals')
    .select(savingsGoalSelectFields)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    const dbError = new Error(`Failed to fetch savings goals: ${error.message}`);
    dbError.statusCode = 500;
    throw dbError;
  }

  return data || [];
};

const getSavingsGoalById = async (userId, savingsGoalId) => {
  const { data, error } = await supabase
    .from('savings_goals')
    .select(savingsGoalSelectFields)
    .eq('id', savingsGoalId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    const dbError = new Error(`Failed to fetch savings goal: ${error.message}`);
    dbError.statusCode = 500;
    throw dbError;
  }

  if (!data) {
    const notFoundError = new Error('Savings goal not found');
    notFoundError.statusCode = 404;
    throw notFoundError;
  }

  return data;
};

const updateSavingsGoal = async (userId, savingsGoalId, updates) => {
  await getSavingsGoalById(userId, savingsGoalId);

  const { data, error } = await supabase
    .from('savings_goals')
    .update(updates)
    .eq('id', savingsGoalId)
    .eq('user_id', userId)
    .select(savingsGoalSelectFields)
    .single();

  if (error) {
    const dbError = new Error(`Failed to update savings goal: ${error.message}`);
    dbError.statusCode = 500;
    throw dbError;
  }

  return data;
};

const deleteSavingsGoal = async (userId, savingsGoalId) => {
  await getSavingsGoalById(userId, savingsGoalId);

  const { error } = await supabase
    .from('savings_goals')
    .delete()
    .eq('id', savingsGoalId)
    .eq('user_id', userId);

  if (error) {
    const dbError = new Error(`Failed to delete savings goal: ${error.message}`);
    dbError.statusCode = 500;
    throw dbError;
  }
};

module.exports = {
  createSavingsGoal,
  getSavingsGoals,
  getSavingsGoalById,
  updateSavingsGoal,
  deleteSavingsGoal,
};
