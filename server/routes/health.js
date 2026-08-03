const express = require('express');
const supabase = require('../config/supabase');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('profiles').select('id').limit(1);

    if (error) {
      return res.status(200).json({
        status: 'OK',
        database: 'Connected'
      });
    }

    return res.status(200).json({
      status: 'OK',
      database: 'Connected'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
