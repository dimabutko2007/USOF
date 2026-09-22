const { pool } = require('../config/db');

class CategoryRepository {
  async findAll() {
    const [rows] = await pool.query(
      `SELECT id, title, description FROM categories ORDER BY id ASC;`
    );
    return rows;
  }

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT id, title, description FROM categories WHERE id = ?;`,
      [id]
    );
    return rows[0] || null;
  }

  async findByTitle(title) {
    const [rows] = await pool.query(
      `SELECT id, title, description FROM categories WHERE title = ?;`,
      [title]
    );
    return rows[0] || null;
  }

  async findPostsByCategoryId(categoryId, currentUser = null) {
    let statusCondition = `p.status = 'active'`;
    const params = [categoryId];

    if (currentUser) {
      if (currentUser.role === 'admin') {
        statusCondition = `1=1`;
      } else {
        statusCondition = `(p.status = 'active' OR p.author_id = ?)`;
        params.unshift(currentUser.id);
      }
    }

    const [rows] = await pool.query(
      `SELECT p.id, p.author_id, u.login AS author_login, p.title, p.content, p.status, p.publish_date,
              COALESCE(SUM(CASE WHEN l.type = 'like' THEN 1 WHEN l.type = 'dislike' THEN -1 ELSE 0 END), 0) AS likes_count
       FROM posts p
       JOIN post_categories pc ON p.id = pc.post_id
       JOIN users u ON p.author_id = u.id
       LEFT JOIN likes l ON l.target_type = 'post' AND l.target_id = p.id
       WHERE pc.category_id = ? AND ${statusCondition}
       GROUP BY p.id
       ORDER BY p.publish_date DESC;`,
      params
    );
    return rows;
  }

  async create({ title, description }) {
    const [result] = await pool.query(
      `INSERT INTO categories (title, description) VALUES (?, ?);`,
      [title, description || null]
    );
    return result.insertId;
  }

  async update(id, { title, description }) {
    const fields = [];
    const values = [];

    if (title !== undefined) {
      fields.push('title = ?');
      values.push(title);
    }
    if (description !== undefined) {
      fields.push('description = ?');
      values.push(description);
    }

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await pool.query(
      `UPDATE categories SET ${fields.join(', ')} WHERE id = ?;`,
      values
    );
    return result.affectedRows > 0;
  }

  async delete(id) {
    const [result] = await pool.query(
      `DELETE FROM categories WHERE id = ?;`,
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new CategoryRepository();
