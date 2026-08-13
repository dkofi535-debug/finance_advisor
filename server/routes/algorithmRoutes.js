const express = require('express');
const {
  searchTransactionsForUser,
  getSavingsRecommendationForUser,
  getBudgetOptimizationForUser,
} = require('../controllers/algorithmController');

const router = express.Router();

router.get('/transactions/search', searchTransactionsForUser);
router.get('/savings/recommendation', getSavingsRecommendationForUser);
router.get('/budgets/optimization', getBudgetOptimizationForUser);

module.exports = router;
