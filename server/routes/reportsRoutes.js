const express = require('express');
const { getMonthlyReport, getCategoryReport, getBudgetReport, getSavingsReport } = require('../controllers/reportsController');

const router = express.Router();

router.get('/monthly', getMonthlyReport);
router.get('/category', getCategoryReport);
router.get('/budget', getBudgetReport);
router.get('/savings', getSavingsReport);

module.exports = router;
