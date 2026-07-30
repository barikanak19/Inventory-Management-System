const BulkUploadService = require('../services/bulkUploadService');
const asyncHandler = require('../utils/asyncHandler');

const upload = asyncHandler(async (req, res) => {
  const summary = await BulkUploadService.processFile(req.file);
  res.status(200).json({
    success: true,
    message: `Upload complete: ${summary.successCount} succeeded, ${summary.failedCount} failed`,
    data: summary
  });
});

module.exports = { upload };