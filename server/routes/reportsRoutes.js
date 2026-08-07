const express = require('express');
const {
  getMonthlyReport,
  getCategoryReport,
  getBudgetReport,
  getSavingsReport,
} = require('../controllers/reportsController');

const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/monthly', getMonthlyReport);
router.get('/category', getCategoryReport);
router.get('/budget', getBudgetReport);
router.get('/savings', getSavingsReport);

module.exports = router;