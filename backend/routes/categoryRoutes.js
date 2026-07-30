const express = require('express');
const { body, param } = require('express-validator');
const categoryController = require('../controllers/categoryController');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticate);

const nameValidator = body('name')
  .trim()
  .notEmpty().withMessage('Category name is required')
  .isLength({ max: 150 }).withMessage('Category name must be under 150 characters');

const idValidator = param('id').isInt({ min: 1 }).withMessage('Invalid category id');

router.get('/', categoryController.list);
router.get('/:id', idValidator, validate, categoryController.getOne);
router.post('/', nameValidator, validate, categoryController.create);
router.put('/:id', idValidator, nameValidator, validate, categoryController.update);
router.delete('/:id', idValidator, validate, categoryController.remove);

module.exports = router;