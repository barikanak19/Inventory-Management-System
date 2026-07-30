const AuthService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await AuthService.register({ email, password });

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: result
  });
});

/**
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await AuthService.login({ email, password });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result
  });
});

/**
 * GET /api/auth/me  (protected)
 */
const getProfile = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: { user: req.user }
  });
});

module.exports = { register, login, getProfile };
