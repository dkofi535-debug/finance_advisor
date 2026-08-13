const {
  searchTransactions,
  generateSavingsRecommendation,
  optimizeBudget,
} = require('../services/algorithmService');

const searchTransactionsForUser = async (req, res, next) => {
  try {
    const { category, type, amount, date, description } = req.query;

    const result = await searchTransactions({
      userId: req.user.id,
      category,
      type,
      amount,
      date,
      description,
    });

    return res.status(200).json({
      success: true,
      message: 'Transaction search completed.',
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const getSavingsRecommendationForUser = async (req, res, next) => {
  try {
    const { amount } = req.query;

    const result = await generateSavingsRecommendation({
      userId: req.user.id,
      availableAmount: amount,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const getBudgetOptimizationForUser = async (req, res, next) => {
  try {
    const { month, year } = req.query;

    const result = await optimizeBudget({
      userId: req.user.id,
      month,
      year,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchTransactionsForUser,
  getSavingsRecommendationForUser,
  getBudgetOptimizationForUser,
};
