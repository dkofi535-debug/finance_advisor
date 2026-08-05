const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  create,
  list,
  getOne,
  update,
  remove,
} = require('../controllers/savingsController');

const router = express.Router();

router.use(authMiddleware);

router.post('/', create);
router.get('/', list);
router.get('/:id', getOne);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
