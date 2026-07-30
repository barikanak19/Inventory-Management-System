const { pool } = require('../config/db');

const CategoryModel = {
  async findAll(search) {
    if (search) {
      const [rows] = await pool.query(
        `SELECT id, name, created_at, updated_at FROM categories
         WHERE name LIKE :search ORDER BY name ASC`,
        { search: `%${search}%` }
      );
      return rows;
    }
    const [rows] = await pool.query(
      'SELECT id, name, created_at, updated_at FROM categories ORDER BY name ASC'
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, name, created_at, updated_at FROM categories WHERE id = :id LIMIT 1',
      { id }
    );
    return rows[0] || null;
  },

  async findByName(name) {
    const [rows] = await pool.query(
      'SELECT id, name FROM categories WHERE name = :name LIMIT 1',
      { name }
    );
    return rows[0] || null;
  },

  async create({ name }) {
    const [result] = await pool.query('INSERT INTO categories (name) VALUES (:name)', { name });
    return this.findById(result.insertId);
  },

  async update(id, { name }) {
    await pool.query('UPDATE categories SET name = :name WHERE id = :id', { id, name });
    return this.findById(id);
  },

  async remove(id) {
    await pool.query('DELETE FROM categories WHERE id = :id', { id });
  },

  async productCount(id) {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS count FROM products WHERE category_id = :id',
      { id }
    );
    return rows[0].count;
  }
};

module.exports = CategoryModel;