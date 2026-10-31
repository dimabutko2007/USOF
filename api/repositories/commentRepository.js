const { pool } = require('../config/db');

class CommentRepository {
  async findCommentsByPostId(postId, filters = {}) {
    let statusCondition = '';
    const params = [postId];

    if (filters && filters.status && ['active', 'inactive'].includes(filters.status)) {
      statusCondition = `AND c.status = ?`;
      params.push(filters.status);
    }

    let orderBy = `ORDER BY likes_count ASC, c.publish_date ASC`;
    if (filters && filters.sort === 'likes_desc') {
      orderBy = `ORDER BY likes_count DESC, c.publish_date ASC`;
    } else if (filters && filters.sort === 'date_desc') {
      orderBy = `ORDER BY c.publish_date DESC`;
    } else if (filters && filters.sort === 'date_asc') {
      orderBy = `ORDER BY c.publish_date ASC`;
    }

    const [rows] = await pool.query(
      `SELECT c.id, c.parent_id, c.author_id, u.login AS author_login, u.profile_picture AS author_avatar,
              c.post_id, c.content, c.status, c.publish_date,
              COALESCE(SUM(CASE WHEN l.type = 'like' THEN 1 WHEN l.type = 'dislike' THEN -1 ELSE 0 END), 0) AS likes_count
       FROM comments c
       JOIN users u ON c.author_id = u.id
       LEFT JOIN likes l ON l.target_type = 'comment' AND l.target_id = c.id
       WHERE c.post_id = ? ${statusCondition}
       GROUP BY c.id
       ${orderBy};`,
      params
    );
    return rows;
  }

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT c.id, c.parent_id, c.author_id, u.login AS author_login, u.profile_picture AS author_avatar,
              c.post_id, c.content, c.status, c.publish_date,
              COALESCE(SUM(CASE WHEN l.type = 'like' THEN 1 WHEN l.type = 'dislike' THEN -1 ELSE 0 END), 0) AS likes_count
       FROM comments c
       JOIN users u ON c.author_id = u.id
       LEFT JOIN likes l ON l.target_type = 'comment' AND l.target_id = c.id
       WHERE c.id = ?
       GROUP BY c.id;`,
      [id]
    );
    return rows[0] || null;
  }

  async create({ author_id, post_id, parent_id = null, content, status = 'active' }) {
    const [result] = await pool.query(
      `INSERT INTO comments (author_id, post_id, parent_id, content, status) VALUES (?, ?, ?, ?, ?);`,
      [author_id, post_id, parent_id || null, content, status]
    );
    return result.insertId;
  }

  async updateStatus(id, status) {
    const [result] = await pool.query(
      `UPDATE comments SET status = ? WHERE id = ?;`,
      [status, id]
    );
    return result.affectedRows > 0;
  }

  async delete(id) {
    const [result] = await pool.query(
      `DELETE FROM comments WHERE id = ?;`,
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new CommentRepository();
