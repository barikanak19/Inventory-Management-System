const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const ApiError = require('../utils/ApiError');
const { jwt: jwtConfig } = require('../config/env');

const SALT_ROUNDS = 12;

function signToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );
}

const AuthService = {
  /**
   * Registers a new user. Passwords are hashed with bcrypt
   * (never stored or logged in plain text).
   */
  async register({ name, email, password, confirmPassword }) {
    const safeName = String(name || '').trim();
    const safeEmail = String(email || '').trim().toLowerCase();

    if (safeName && safeName.length < 2) {
      throw ApiError.badRequest('Name must be at least 2 characters');
    }

    if (!safeEmail) {
      throw ApiError.badRequest('Email is required');
    }

    if (!password) {
      throw ApiError.badRequest('Password is required');
    }

    if (!confirmPassword) {
      throw ApiError.badRequest('Confirm password is required');
    }

    if (password !== confirmPassword) {
      throw ApiError.badRequest('Passwords do not match');
    }

    const existing = await UserModel.findByEmail(safeEmail);
    if (existing) {
      throw ApiError.conflict('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await UserModel.create({ name: safeName, email: safeEmail, passwordHash });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    };
  },

  /**
   * Authenticates a user by email/password and issues a JWT.
   * Uses a generic error message on failure to avoid leaking
   * whether the email exists (prevents user enumeration).
   */
  async login({ email, password }) {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const token = signToken(user);
    return { user: { id: user.id, email: user.email }, token };
  }
};

module.exports = AuthService;
