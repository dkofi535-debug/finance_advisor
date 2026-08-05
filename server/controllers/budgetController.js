const {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
} = require('../services/budgetService');

const validateBudgetPayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    const error = new Error('Request body is required.');
    error.statusCode = 400;
    throw error;
  }

  const { category, monthly_limit, month, year } = payload;

  if (!category || typeof category !== 'string' || !category.trim()) {
    const error = new Error('Category is required.');
    error.statusCode = 400;
    throw error;
  }

  const numericLimit = Number(monthly_limit);
  if (!Number.isFinite(numericLimit) || numericLimit <= 0) {
    const error = new Error('monthly_limit must be greater than 0.');
    error.statusCode = 400;
    throw error;
  }

  const numericMonth = Number(month);
  if (!Number.isInteger(numericMonth) || numericMonth < 1 || numericMonth > 12) {
    const error = new Error('month must be between 1 and 12.');
    error.statusCode = 400;
    throw error;
  }

  const numericYear = Number(year);
  if (!Number.isInteger(numericYear) || String(numericYear).length !== 4) {
    const error = new Error('year must be a valid four-digit year.');
    error.statusCode = 400;
    throw error;
  }

  return {
    category: category.trim(),
    monthly_limit: numericLimit,
    month: numericMonth,
    year: numericYear,
  };
};

const create = async (req, res, next) => {
  try {
    const budgetData = validateBudgetPayload(req.body);
    const budget = await createBudget({ userId: req.user.id, ...budgetData });

    return res.status(201).json({
      success: true,
      message: 'Budget created successfully.',
      budget,
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
    const budgets = await getBudgets(req.user.id);

    return res.status(200).json({
      success: true,
      budgets,
    });
  } catch (error) {
    next(error);
  }
};

const getOne = async (req, res, next) => {
  try {
    const budget = await getBudgetById(req.user.id, req.params.id);

    return res.status(200).json({
      success: true,
      budget,
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found.',
      });
    }

    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const budgetData = validateBudgetPayload(req.body);
    const budget = await updateBudget(req.user.id, req.params.id, budgetData);

    return res.status(200).json({
      success: true,
      message: 'Budget updated successfully.',
      budget,
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
        message: 'Budget not found.',
      });
    }

    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await deleteBudget(req.user.id, req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Budget deleted successfully.',
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found.',
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
