const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  namedPlaceholders: true,
  dateStrings: true
});

/**
 * Simple helper to test DB connectivity at startup.
 * Fails fast with a clear error if MySQL is unreachable
 * or credentials are wrong, instead of failing silently later.
 */
async function testConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.query('SELECT 1');
    console.log('[DB] MySQL connection pool established successfully.');
  } finally {
    connection.release();
  }
}

module.exports = { pool, testConnection };
