const { pool } = require('../config/db');

class NotificationRepository {
  /**
   * Create notifications in bulk for a list of user IDs
   */
  async createBulk(userIds, message) {
    if (!userIds || userIds.length === 0) return true;

    const values = userIds.map(userId => [userId, message]);
    const sql = `INSERT INTO notifications (user_id, message) VALUES ?;`;
    await pool.query(sql, [values]);
    return true;
  }

  /**
   * Get notifications for a user
   */
  async findByUserId(userId) {
    const sql = `
      SELECT id, user_id, message, is_read, created_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC;
    `;
    const [rows] = await pool.query(sql, [userId]);
    return rows;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    const sql = `
      UPDATE notifications
      SET is_read = 1
      WHERE id = ? AND user_id = ?;
    `;
    const [result] = await pool.query(sql, [notificationId, userId]);
    return result.affectedRows > 0;
  }

  /**
   * Find single notification by ID
   */
  async findById(notificationId) {
    const [rows] = await pool.query(
      `SELECT id, user_id, message, is_read, created_at FROM notifications WHERE id = ?;`,
      [notificationId]
    );
    return rows[0] || null;
  }
}

module.exports = new NotificationRepository();
