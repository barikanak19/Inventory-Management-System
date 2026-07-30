const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Runs after an array of express-validator checks.
 * If any validation failed, throws a single ApiError(400)
 * with all field-level messages attached.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({
      field: e.path,
      message: e.msg
    }));
    return next(ApiError.badRequest('Validation failed', formatted));
  }
  next();
}

module.exports = validate;
