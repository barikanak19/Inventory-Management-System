require('dotenv').config();

/**
 * Centralized, validated access to environment variables.
 * Throws early at startup if a required variable is missing,
 * instead of causing confusing failures deep in the app.
 */
const required = ['DB_HOST', 'DB_USER', 'DB_NAME', 'JWT_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`[Config Error] Missing required environment variable: ${key}`);
  }
}

const defaultAllowedOrigins = [
  'https://inventory-management-systemims.vercel.app',
  'http://localhost:4200'
];

const allowedOrigins = Array.from(
  new Set([
    ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
    ...(process.env.LOCAL_CLIENT_URL ? [process.env.LOCAL_CLIENT_URL] : []),
    ...defaultAllowedOrigins
  ])
);

module.exports = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'https://inventory-management-systemims.vercel.app',
  localClientUrl: process.env.LOCAL_CLIENT_URL || 'http://localhost:4200',
  allowedOrigins,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  },
  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads/products',
    maxSizeMb: Number(process.env.MAX_UPLOAD_SIZE_MB) || 5
  }
};
