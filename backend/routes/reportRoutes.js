const express = require('express');
const { query } = require('express-validator');
const reportController = require('../controllers/reportController');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticate);

router.get(
  '/products',
  [query('format').optional().isIn(['csv', 'xlsx'])],
  validate,
  reportController.downloadProductsReport
);

module.exports = router;