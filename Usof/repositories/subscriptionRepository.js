const { pool } = require('../config/db');

class SubscriptionRepository {
  /**
   * Subscribe user to post
   */
  async create(userId, postId) {
    const [result] = await pool.query(
      `INSERT IGNORE INTO post_subscriptions (user_id, post_id) VALUES (?, ?);`,
      [userId, postId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Unsubscribe user from post
   */
  async delete(userId, postId) {
    const [result] = await pool.query(
      `DELETE FROM post_subscriptions WHERE user_id = ? AND post_id = ?;`,
      [userId, postId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Get all user IDs subscribed to a post
   */
  async findSubscribersByPostId(postId) {
    const [rows] = await pool.query(
      `SELECT user_id FROM post_subscriptions WHERE post_id = ?;`,
      [postId]
    );
    return rows.map(r => r.user_id);
  }

  /**
   * Check if user is subscribed to post
   */
  async isSubscribed(userId, postId) {
    const [rows] = await pool.query(
      `SELECT id FROM post_subscriptions WHERE user_id = ? AND post_id = ?;`,
      [userId, postId]
    );
    return rows.length > 0;
  }
}

module.exports = new SubscriptionRepository();
