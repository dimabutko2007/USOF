const { pool } = require('../config/db');

class UserRepository {
  /**
   * Get all users
   */
  async findAll() {
    const [rows] = await pool.query(
      `SELECT id, login, full_name, email, is_email_confirmed, profile_picture, rating, role, created_at 
       FROM users 
       ORDER BY id ASC;`
    );
    return rows;
  }

  /**
   * Get user by ID
   */
  async findById(id) {
    const [rows] = await pool.query(
      `SELECT id, login, full_name, email, is_email_confirmed, profile_picture, rating, role, created_at 
       FROM users 
       WHERE id = ?;`,
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Get full user details including password by ID
   */
  async findByIdWithPassword(id) {
    const [rows] = await pool.query(
      `SELECT * FROM users WHERE id = ?;`,
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Get user by login
   */
  async findByLogin(login) {
    const [rows] = await pool.query(
      `SELECT * FROM users WHERE login = ?;`,
      [login]
    );
    return rows[0] || null;
  }

  /**
   * Get user by email
   */
  async findByEmail(email) {
    const [rows] = await pool.query(
      `SELECT * FROM users WHERE email = ?;`,
      [email]
    );
    return rows[0] || null;
  }

  /**
   * Find user by email confirmation token
   */
  async findByConfirmToken(token) {
    const [rows] = await pool.query(
      `SELECT * FROM users WHERE confirm_token = ?;`,
      [token]
    );
    return rows[0] || null;
  }

  /**
   * Find user by valid password reset token
   */
  async findByResetToken(token) {
    const [rows] = await pool.query(
      `SELECT * FROM users 
       WHERE reset_token = ? AND reset_token_expires > NOW();`,
      [token]
    );
    return rows[0] || null;
  }

  /**
   * Create a new user
   */
  async create({ login, password, full_name, email, role = 'user', is_email_confirmed = 0, confirm_token = null }) {
    const [result] = await pool.query(
      `INSERT INTO users (login, password, full_name, email, role, is_email_confirmed, confirm_token) 
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [login, password, full_name, email, role, is_email_confirmed, confirm_token]
    );
    return result.insertId;
  }

  /**
   * Update user details (login, full_name, email, role)
   */
  async update(id, { login, full_name, email, role }) {
    const fields = [];
    const values = [];

    if (login !== undefined) {
      fields.push('login = ?');
      values.push(login);
    }
    if (full_name !== undefined) {
      fields.push('full_name = ?');
      values.push(full_name);
    }
    if (email !== undefined) {
      fields.push('email = ?');
      values.push(email);
    }
    if (role !== undefined) {
      fields.push('role = ?');
      values.push(role);
    }

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?;`,
      values
    );
    return result.affectedRows > 0;
  }

  /**
   * Update user profile picture
   */
  async updateAvatar(id, profile_picture) {
    const [result] = await pool.query(
      `UPDATE users SET profile_picture = ? WHERE id = ?;`,
      [profile_picture, id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Confirm email status for user
   */
  async confirmEmail(id) {
    const [result] = await pool.query(
      `UPDATE users SET is_email_confirmed = 1, confirm_token = NULL WHERE id = ?;`,
      [id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Save password reset token and expiration
   */
  async saveResetToken(id, resetToken, expiresAt) {
    const [result] = await pool.query(
      `UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?;`,
      [resetToken, expiresAt, id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Reset password and clear tokens
   */
  async updatePassword(id, hashedPassword) {
    const [result] = await pool.query(
      `UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?;`,
      [hashedPassword, id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Delete user by ID
   */
  async delete(id) {
    const [result] = await pool.query(
      `DELETE FROM users WHERE id = ?;`,
      [id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Recalculate and update user rating
   */
  async recalculateRating(userId) {
    const [result] = await pool.query(
      `UPDATE users u
       SET rating = (
         COALESCE((
           SELECT COUNT(*) FROM likes l 
           JOIN posts p ON l.target_type = 'post' AND l.target_id = p.id 
           WHERE p.author_id = ? AND l.type = 'like'
         ), 0)
         +
         COALESCE((
           SELECT COUNT(*) FROM likes l 
           JOIN comments c ON l.target_type = 'comment' AND l.target_id = c.id 
           WHERE c.author_id = ? AND l.type = 'like'
         ), 0)
         -
         COALESCE((
           SELECT COUNT(*) FROM likes l 
           JOIN posts p ON l.target_type = 'post' AND l.target_id = p.id 
           WHERE p.author_id = ? AND l.type = 'dislike'
         ), 0)
         -
         COALESCE((
           SELECT COUNT(*) FROM likes l 
           JOIN comments c ON l.target_type = 'comment' AND l.target_id = c.id 
           WHERE c.author_id = ? AND l.type = 'dislike'
         ), 0)
       )
       WHERE u.id = ?;`,
      [userId, userId, userId, userId, userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new UserRepository();
