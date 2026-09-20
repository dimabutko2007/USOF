const { pool } = require('../config/db');

class FavoriteRepository {
  async add(userId, postId) {
    const [result] = await pool.query(
      `INSERT IGNORE INTO favorites (user_id, post_id) VALUES (?, ?);`,
      [userId, postId]
    );
    return result.affectedRows > 0;
  }

  async remove(userId, postId) {
    const [result] = await pool.query(
      `DELETE FROM favorites WHERE user_id = ? AND post_id = ?;`,
      [userId, postId]
    );
    return result.affectedRows > 0;
  }

  async getUserFavorites(userId) {
    const [rows] = await pool.query(
      `SELECT p.id, p.author_id, u.login AS author_login, u.profile_picture AS author_avatar,
              p.title, p.content, p.status, p.publish_date, f.created_at AS favorited_at,
              COALESCE(SUM(CASE WHEN l.type = 'like' THEN 1 WHEN l.type = 'dislike' THEN -1 ELSE 0 END), 0) AS likes_count
       FROM favorites f
       JOIN posts p ON f.post_id = p.id
       JOIN users u ON p.author_id = u.id
       LEFT JOIN likes l ON l.target_type = 'post' AND l.target_id = p.id
       WHERE f.user_id = ? AND p.status = 'active'
       GROUP BY p.id
       ORDER BY f.created_at DESC;`,
      [userId]
    );
    return rows;
  }
}

module.exports = new FavoriteRepository();
