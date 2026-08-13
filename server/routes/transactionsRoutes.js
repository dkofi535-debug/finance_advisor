const express = require('express');

const {
  create,
  list,
  getOne,
  update,
  remove,
} = require('../controllers/transactionsController');

const {
  searchTransactionsForUser,
} = require('../controllers/algorithmController');

const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

// ===============================
// Transaction Routes
// ===============================

// Create transaction
router.post('/', create);

// Get all transactions
router.get('/', list);

// Search transactions
// IMPORTANT: Must come BEFORE /:id
router.get('/search', searchTransactionsForUser);

// Get one transaction
router.get('/:id', getOne);

// Update transaction
router.put('/:id', update);

// Delete transaction
router.delete('/:id', remove);

module.exports = router;