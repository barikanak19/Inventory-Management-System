const ReportService = require('../services/reportService');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const downloadProductsReport = asyncHandler(async (req, res) => {
  const { format = 'csv', search, categoryId } = req.query;

  if (format === 'csv') {
    await ReportService.streamCsv(res, { search, categoryId });
  } else if (format === 'xlsx') {
    await ReportService.streamXlsx(res, { search, categoryId });
  } else {
    throw ApiError.badRequest('Invalid format. Use "csv" or "xlsx".');
  }
});

module.exports = { downloadProductsReport };