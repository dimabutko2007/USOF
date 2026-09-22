const { pool } = require('../config/db');

class CommentRepository {
  async findCommentsByPostId(postId, currentUser = null) {
    let statusCondition = `c.status = 'active'`;
    const params = [postId];

    if (currentUser) {
      if (currentUser.role === 'admin') {
        statusCondition = `1=1`;
      } else {
        statusCondition = `(c.status = 'active' OR c.author_id = ?)`;
        params.unshift(currentUser.id);
      }
    }

    const [rows] = await pool.query(
      `SELECT c.id, c.author_id, u.login AS author_login, u.profile_picture AS author_avatar,
              c.post_id, c.content, c.status, c.publish_date,
              COALESCE(SUM(CASE WHEN l.type = 'like' THEN 1 WHEN l.type = 'dislike' THEN -1 ELSE 0 END), 0) AS likes_count
       FROM comments c
       JOIN users u ON c.author_id = u.id
       LEFT JOIN likes l ON l.target_type = 'comment' AND l.target_id = c.id
       WHERE c.post_id = ? AND ${statusCondition}
       GROUP BY c.id
       ORDER BY c.publish_date ASC;`,
      params
    );
    return rows;
  }

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT c.id, c.author_id, u.login AS author_login, u.profile_picture AS author_avatar,
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

  async create({ author_id, post_id, content }) {
    const [result] = await pool.query(
      `INSERT INTO comments (author_id, post_id, content, status) VALUES (?, ?, ?, 'active');`,
      [author_id, post_id, content]
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
