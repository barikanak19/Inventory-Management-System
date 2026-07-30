const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { upload: uploadConfig } = require('../config/env');
const ApiError = require('../utils/ApiError');

const uploadDir = path.join(__dirname, '..', uploadConfig.dir);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `product-${uniqueSuffix}${ext}`);
  }
});

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(ApiError.badRequest('Only JPEG, PNG, WEBP, or GIF images are allowed'));
  }
  cb(null, true);
}

const uploadProductImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: uploadConfig.maxSizeMb * 1024 * 1024 }
});

function deleteImageFile(imagePath) {
  if (!imagePath) return;
  const absolutePath = path.join(__dirname, '..', imagePath);
  fs.unlink(absolutePath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.error('[Upload] Failed to delete image file:', absolutePath, err.message);
    }
  });
}

module.exports = { uploadProductImage, deleteImageFile, uploadDir };