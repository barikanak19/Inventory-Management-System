const { pool } = require('../config/db');

/**
 * Data-access layer for the `users` table.
 * Keeps raw SQL isolated from business logic (services/controllers).
 */
const UserModel = {
  async findByEmail(email) {
    const [rows] = await pool.query(
      'SELECT id, email, password_hash, created_at FROM users WHERE email = :email LIMIT 1',
      { email }
    );
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, email, created_at FROM users WHERE id = :id LIMIT 1',
      { id }
    );
    return rows[0] || null;
  },

  async create({ email, passwordHash }) {
    const [result] = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES (:email, :passwordHash)',
      { email, passwordHash }
    );
    return { id: result.insertId, email };
  }
};

module.exports = UserModel;
