const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

const registerValidators = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 }).withMessage('Name must be between 2 and 150 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/\d/).withMessage('Password must contain at least one number'),
  body('confirmPassword')
    .notEmpty().withMessage('Confirm password is required')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match')
];

const loginValidators = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
];

// POST /api/auth/register
router.post('/register', registerValidators, validate, authController.register);

// POST /api/auth/login
router.post('/login', loginValidators, validate, authController.login);

// GET /api/auth/me (protected route example)
router.get('/me', authenticate, authController.getProfile);

module.exports = router;
