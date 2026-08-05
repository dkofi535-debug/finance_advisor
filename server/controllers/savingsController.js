const {
  createSavingsGoal,
  getSavingsGoals,
  getSavingsGoalById,
  updateSavingsGoal,
  deleteSavingsGoal,
} = require('../services/savingsService');

const validateSavingsPayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    const error = new Error('Request body is required.');
    error.statusCode = 400;
    throw error;
  }

  const { goal_name, target_amount, current_amount, target_date } = payload;

  if (!goal_name || typeof goal_name !== 'string' || !goal_name.trim()) {
    const error = new Error('goal_name is required.');
    error.statusCode = 400;
    throw error;
  }

  const numericTargetAmount = Number(target_amount);

  if (!Number.isFinite(numericTargetAmount) || numericTargetAmount <= 0) {
    const error = new Error('target_amount must be greater than 0.');
    error.statusCode = 400;
    throw error;
  }

  const numericCurrentAmount =
    current_amount === undefined ? 0 : Number(current_amount);

  if (
    !Number.isFinite(numericCurrentAmount) ||
    numericCurrentAmount < 0
  ) {
    const error = new Error('current_amount cannot be negative.');
    error.statusCode = 400;
    throw error;
  }

  let normalizedTargetDate = null;

  if (target_date && typeof target_date === 'string' && target_date.trim()) {
    const parsedDate = new Date(target_date);

    if (Number.isNaN(parsedDate.getTime())) {
      const error = new Error('target_date must be a valid date.');
      error.statusCode = 400;
      throw error;
    }

    normalizedTargetDate = parsedDate.toISOString().split('T')[0];
  }

  return {
    goal_name: goal_name.trim(),
    target_amount: numericTargetAmount,
    current_amount: numericCurrentAmount,
    target_date: normalizedTargetDate,
  };
};


const create = async (req, res, next) => {
  try {
    const savingsData = validateSavingsPayload(req.body);
    const savingsGoal = await createSavingsGoal({
      userId: req.user.id,
      ...savingsData,
    });

    return res.status(201).json({
      success: true,
      message: 'Savings goal created successfully.',
      data: savingsGoal,
    });
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
};

const list = async (req, res, next) => {
  try {
    const savingsGoals = await getSavingsGoals(req.user.id);

    return res.status(200).json({
      success: true,
      data: savingsGoals,
    });
  } catch (error) {
    next(error);
  }
};

const getOne = async (req, res, next) => {
  try {
    const savingsGoal = await getSavingsGoalById(req.user.id, req.params.id);

    return res.status(200).json({
      success: true,
      data: savingsGoal,
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found.',
      });
    }

    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const savingsData = validateSavingsPayload(req.body);
    const savingsGoal = await updateSavingsGoal(
      req.user.id,
      req.params.id,
      savingsData
    );

    return res.status(200).json({
      success: true,
      message: 'Savings goal updated successfully.',
      data: savingsGoal,
    });
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found.',
      });
    }

    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await deleteSavingsGoal(req.user.id, req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Savings goal deleted successfully.',
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found.',
      });
    }

    next(error);
  }
};

module.exports = {
  create,
  list,
  getOne,
  update,
  remove,
};
