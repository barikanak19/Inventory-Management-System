const multer = require('multer');
const ApiError = require('../utils/ApiError');

const ALLOWED_EXTENSIONS = ['.csv', '.xlsx'];
const ALLOWED_MIME_TYPES = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/octet-stream'
];

function fileFilter(req, file, cb) {
  const ext = file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase();
  const extOk = ALLOWED_EXTENSIONS.includes(ext);
  const mimeOk = ALLOWED_MIME_TYPES.includes(file.mimetype);

  if (!extOk || !mimeOk) {
    return cb(ApiError.badRequest('Only .csv or .xlsx files are allowed'));
  }
  cb(null, true);
}

const uploadBulkFile = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }
});

module.exports = { uploadBulkFile };