const express = require('express');
const { body, param, query } = require('express-validator');
const productController = require('../controllers/productController');
const bulkUploadController = require('../controllers/bulkUploadController');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/authMiddleware');
const { uploadProductImage } = require('../middlewares/uploadMiddleware');
const { uploadBulkFile } = require('../middlewares/bulkUploadMiddleware');

const router = express.Router();

router.use(authenticate);

const idValidator = param('id').isInt({ min: 1 }).withMessage('Invalid product id');

const productBodyValidators = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ max: 200 }).withMessage('Product name must be under 200 characters'),
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('categoryId')
    .notEmpty().withMessage('Category is required')
    .isInt({ min: 1 }).withMessage('Invalid category id')
];

const listQueryValidators = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sort').optional().isIn(['name', 'price', 'created_at']),
  query('order').optional().isIn(['asc', 'desc', 'ASC', 'DESC'])
];

router.post(
  '/bulk-upload',
  uploadBulkFile.single('file'),
  bulkUploadController.upload
);

router.get('/', listQueryValidators, validate, productController.list);
router.get('/:id', idValidator, validate, productController.getOne);

router.post(
  '/',
  uploadProductImage.single('image'),
  productBodyValidators,
  validate,
  productController.create
);

router.put(
  '/:id',
  idValidator,
  uploadProductImage.single('image'),
  productBodyValidators,
  validate,
  productController.update
);

router.delete('/:id', idValidator, validate, productController.remove);

module.exports = router;