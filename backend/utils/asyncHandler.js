/**
 * Wraps an async Express route handler and forwards any
 * rejected promise to next(), so we never need try/catch
 * boilerplate in every controller.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
