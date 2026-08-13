const express = require('express');

const {
  create,
  list,
  getOne,
  update,
  remove,
} = require('../controllers/budgetController');

const {
  getBudgetOptimizationForUser,
} = require('../controllers/algorithmController');

const router = express.Router();

router.post('/', create);
router.get('/', list);

// IMPORTANT: before /:id
router.get('/optimization', getBudgetOptimizationForUser);

router.get('/:id', getOne);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;