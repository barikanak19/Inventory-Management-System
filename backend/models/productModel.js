const { pool } = require('../config/db');

const SORTABLE_COLUMNS = {
  name: 'p.name',
  price: 'p.price',
  created_at: 'p.created_at'
};

function buildFilters({ search, categoryId }) {
  const clauses = [];
  const params = {};

  if (search) {
    clauses.push('p.name LIKE :search');
    params.search = `%${search}%`;
  }
  if (categoryId) {
    clauses.push('p.category_id = :categoryId');
    params.categoryId = categoryId;
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return { where, params };
}

const ProductModel = {
  async findPaginated({ search, categoryId, sortBy, sortOrder, page, limit }) {
    const { where, params } = buildFilters({ search, categoryId });
    const orderColumn = SORTABLE_COLUMNS[sortBy] || 'p.created_at';
    const orderDirection = sortOrder === 'ASC' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
      `SELECT p.id, p.name, p.image_path, p.price, p.category_id,
              c.name AS category_name, p.created_at, p.updated_at
       FROM products p
       JOIN categories c ON c.id = p.category_id
       ${where}
       ORDER BY ${orderColumn} ${orderDirection}
       LIMIT :limit OFFSET :offset`,
      { ...params, limit, offset }
    );

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM products p ${where}`,
      params
    );

    return { items: rows, total: countRows[0].total };
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT p.id, p.name, p.image_path, p.price, p.category_id,
              c.name AS category_name, p.created_at, p.updated_at
       FROM products p
       JOIN categories c ON c.id = p.category_id
       WHERE p.id = :id LIMIT 1`,
      { id }
    );
    return rows[0] || null;
  },

  async create({ name, price, categoryId, imagePath }) {
    const [result] = await pool.query(
      `INSERT INTO products (name, price, category_id, image_path)
       VALUES (:name, :price, :categoryId, :imagePath)`,
      { name, price, categoryId, imagePath: imagePath || null }
    );
    return this.findById(result.insertId);
  },

  async update(id, { name, price, categoryId, imagePath }) {
    const setImage = imagePath !== undefined;
    await pool.query(
      `UPDATE products
       SET name = :name, price = :price, category_id = :categoryId
           ${setImage ? ', image_path = :imagePath' : ''}
       WHERE id = :id`,
      { id, name, price, categoryId, ...(setImage ? { imagePath } : {}) }
    );
    return this.findById(id);
  },

  async remove(id) {
    await pool.query('DELETE FROM products WHERE id = :id', { id });
  },

  async bulkInsert(rows) {
    if (!rows.length) return 0;
    const values = rows.map((r) => [r.name, r.price, r.categoryId, r.imagePath || null]);
    const [result] = await pool.query(
      'INSERT INTO products (name, price, category_id, image_path) VALUES ?',
      [values]
    );
    return result.affectedRows;
  },

  async streamAll({ search, categoryId }) {
    const { where, params } = buildFilters({ search, categoryId });
    const connection = await pool.getConnection();
    const stream = connection.connection
      .query(
        `SELECT p.id, p.name, p.price, c.name AS category_name, p.created_at
         FROM products p
         JOIN categories c ON c.id = p.category_id
         ${where}
         ORDER BY p.id ASC`,
        params
      )
      .stream();

    stream.once('end', () => connection.release());
    stream.once('error', () => connection.release());
    return stream;
  }
};

module.exports = ProductModel;