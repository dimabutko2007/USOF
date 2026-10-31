const { pool } = require('../config/db');

const DEFAULT_CATEGORIES = [
  ['JavaScript', 'All about modern JavaScript, ES6+, and async programming.'],
  ['Node.js & Express', 'Backend development, web servers, and middleware.'],
  ['MySQL & Databases', 'Database design, SQL queries, indexing, and performance.'],
  ['Architecture & SOLID', 'Design patterns, clean code, MVC, and SOLID principles.'],
  ['General Discussions', 'General tech questions, career advice, and project reviews.'],
  ['React & Frontend', 'Component lifecycle, hooks, state management, and modern frontend tools.'],
  ['TypeScript', 'Static typing, interfaces, generics, and compiler configurations for JavaScript.'],
  ['Docker & DevOps', 'Containerization, CI/CD pipelines, Dockerfiles, and cloud deployment workflows.'],
  ['REST & GraphQL APIs', 'API design, HTTP methods, status codes, query schemas, and API security.'],
  ['Git & Version Control', 'Branching strategies, merge conflicts, pull requests, and Git workflows.']
];

class CategoryRepository {
  constructor() {
    this._ensured = false;
  }

  async ensureDefaultCategories() {
    if (this._ensured) return;
    try {
      for (const [title, desc] of DEFAULT_CATEGORIES) {
        await pool.query(
          `INSERT IGNORE INTO categories (title, description) VALUES (?, ?);`,
          [title, desc]
        );
      }
      this._ensured = true;
    } catch (e) {
    }
  }

  async findAll() {
    await this.ensureDefaultCategories();
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
              (SELECT COALESCE(SUM(CASE WHEN l.type = 'like' THEN 1 WHEN l.type = 'dislike' THEN -1 ELSE 0 END), 0) FROM likes l WHERE l.target_type = 'post' AND l.target_id = p.id) AS likes_count
       FROM posts p
       JOIN post_categories pc ON p.id = pc.post_id
       JOIN users u ON p.author_id = u.id
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

  async reassignPostsToGeneralAndDelete(oldCatId, generalCatId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [postsWithOldCat] = await connection.query(
        `SELECT post_id FROM post_categories WHERE category_id = ?;`,
        [oldCatId]
      );

      for (const row of postsWithOldCat) {
        await connection.query(
          `INSERT IGNORE INTO post_categories (post_id, category_id) VALUES (?, ?);`,
          [row.post_id, generalCatId]
        );
      }

      await connection.query(
        `DELETE FROM categories WHERE id = ?;`,
        [oldCatId]
      );

      await connection.commit();
      return true;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }
}

module.exports = new CategoryRepository();
