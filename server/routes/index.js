const express = require('express');
const { getHealth } = require('../controllers/exampleController');

const router = express.Router();

router.get('/health', getHealth);

module.exports = router;
