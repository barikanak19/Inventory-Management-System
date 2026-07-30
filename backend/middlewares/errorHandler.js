const { nodeEnv } = require('../config/env');

/**
 * 404 handler - runs when no route matched.
 */
function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
}

/**
 * Centralized error handler.
 * Every thrown ApiError (or unexpected error) ends up here
 * so the API always returns a consistent JSON shape.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode && err.isOperational ? err.statusCode : 500;
  const message = err.isOperational ? err.message : 'Something went wrong. Please try again later.';

  if (!err.isOperational) {
    // Unexpected/programmer error - log full detail server-side only.
    console.error('[Unhandled Error]', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors && err.errors.length ? err.errors : undefined,
    stack: nodeEnv === 'development' ? err.stack : undefined
  });
}

module.exports = { notFoundHandler, errorHandler };
