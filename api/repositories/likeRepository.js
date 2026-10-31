const { pool } = require('../config/db');

class LikeRepository {
  async findByTarget(targetType, targetId) {
    const [rows] = await pool.query(
      `SELECT l.id, l.author_id, u.login AS author_login, u.profile_picture AS author_avatar,
              l.target_type, l.target_id, l.type, l.publish_date
       FROM likes l
       JOIN users u ON l.author_id = u.id
       WHERE l.target_type = ? AND l.target_id = ?
       ORDER BY l.publish_date DESC;`,
      [targetType, targetId]
    );
    return rows;
  }

  async findByUserAndTarget(authorId, targetType, targetId) {
    const [rows] = await pool.query(
      `SELECT * FROM likes 
       WHERE author_id = ? AND target_type = ? AND target_id = ?;`,
      [authorId, targetType, targetId]
    );
    return rows[0] || null;
  }

  async createOrUpdate({ author_id, target_type, target_id, type }) {
    const [result] = await pool.query(
      `INSERT INTO likes (author_id, target_type, target_id, type)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE type = VALUES(type), publish_date = CURRENT_TIMESTAMP;`,
      [author_id, target_type, target_id, type]
    );
    return result;
  }

  async delete(authorId, targetType, targetId) {
    const [result] = await pool.query(
      `DELETE FROM likes 
       WHERE author_id = ? AND target_type = ? AND target_id = ?;`,
      [authorId, targetType, targetId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new LikeRepository();
