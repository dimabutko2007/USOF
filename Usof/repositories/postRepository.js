const { pool } = require('../config/db');

class PostRepository {
  /**
   * Find all posts with pagination, filtering, sorting, and RBAC visibility rules
   */
  async findAll({ page = 1, limit = 10, sort = 'likes', categories, startDate, endDate, status }, currentUser = null) {
    const offset = (page - 1) * limit;
    const whereConditions = [];
    const params = [];

    // 1. Visibility rules based on RBAC & status filter
    if (!currentUser) {
      whereConditions.push(`p.status = 'active'`);
    } else if (currentUser.role === 'admin') {
      if (status) {
        whereConditions.push(`p.status = ?`);
        params.push(status);
      }
    } else {
      // Regular user: can see active posts or their own inactive posts
      if (status === 'inactive') {
        whereConditions.push(`p.status = 'inactive' AND p.author_id = ?`);
        params.push(currentUser.id);
      } else if (status === 'active') {
        whereConditions.push(`p.status = 'active'`);
      } else {
        whereConditions.push(`(p.status = 'active' OR p.author_id = ?)`);
        params.push(currentUser.id);
      }
    }

    // 2. Category filtering
    if (categories) {
      const catList = Array.isArray(categories) ? categories : categories.split(',').map(c => c.trim());
      if (catList.length > 0) {
        whereConditions.push(`p.id IN (SELECT post_id FROM post_categories WHERE category_id IN (${catList.map(() => '?').join(',')}))`);
        params.push(...catList);
      }
    }

    // 3. Date interval filtering
    if (startDate) {
      whereConditions.push(`p.publish_date >= ?`);
      params.push(startDate);
    }
    if (endDate) {
      whereConditions.push(`p.publish_date <= ?`);
      params.push(endDate);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // 4. Sorting definition
    let orderByClause = `ORDER BY likes_count DESC, p.publish_date DESC`; // Default: by likes
    if (sort === 'date') {
      orderByClause = `ORDER BY p.publish_date DESC`;
    }

    // Main SQL query
    const sql = `
      SELECT p.id, p.author_id, u.login AS author_login, u.profile_picture AS author_avatar,
             p.title, p.content, p.status, p.publish_date,
             COALESCE(SUM(CASE WHEN l.type = 'like' THEN 1 WHEN l.type = 'dislike' THEN -1 ELSE 0 END), 0) AS likes_count,
             GROUP_CONCAT(DISTINCT c.id) AS category_ids,
             GROUP_CONCAT(DISTINCT c.title) AS category_titles
      FROM posts p
      JOIN users u ON p.author_id = u.id
      LEFT JOIN post_categories pc ON p.id = pc.post_id
      LEFT JOIN categories c ON pc.category_id = c.id
      LEFT JOIN likes l ON l.target_type = 'post' AND l.target_id = p.id
      ${whereClause}
      GROUP BY p.id
      ${orderByClause}
      LIMIT ? OFFSET ?;
    `;

    params.push(parseInt(limit, 10), parseInt(offset, 10));
    const [rows] = await pool.query(sql, params);

    if (rows.length === 0) return [];

    const postIds = rows.map(r => r.id);
    const [images] = await pool.query(
      `SELECT post_id, image_path FROM post_images WHERE post_id IN (${postIds.map(() => '?').join(',')})`,
      postIds
    );
    const imagesMap = {};
    images.forEach(img => {
      if (!imagesMap[img.post_id]) imagesMap[img.post_id] = [];
      imagesMap[img.post_id].push(img.image_path);
    });

    // Format post categories array and images
    return rows.map(post => ({
      ...post,
      categories: post.category_ids ? post.category_ids.split(',').map((id, idx) => ({
        id: parseInt(id, 10),
        title: post.category_titles.split(',')[idx]
      })) : [],
      images: imagesMap[post.id] || []
    }));
  }

  /**
   * Get single post by ID with full author, category, and image info
   */
  async findById(id) {
    const sql = `
      SELECT p.id, p.author_id, u.login AS author_login, u.profile_picture AS author_avatar,
             p.title, p.content, p.status, p.publish_date,
             COALESCE(SUM(CASE WHEN l.type = 'like' THEN 1 WHEN l.type = 'dislike' THEN -1 ELSE 0 END), 0) AS likes_count,
             GROUP_CONCAT(DISTINCT c.id) AS category_ids,
             GROUP_CONCAT(DISTINCT c.title) AS category_titles
      FROM posts p
      JOIN users u ON p.author_id = u.id
      LEFT JOIN post_categories pc ON p.id = pc.post_id
      LEFT JOIN categories c ON pc.category_id = c.id
      LEFT JOIN likes l ON l.target_type = 'post' AND l.target_id = p.id
      WHERE p.id = ?
      GROUP BY p.id;
    `;
    const [rows] = await pool.query(sql, [id]);
    if (!rows[0]) return null;

    const post = rows[0];

    const [images] = await pool.query(
      `SELECT image_path FROM post_images WHERE post_id = ?`,
      [id]
    );

    return {
      ...post,
      categories: post.category_ids ? post.category_ids.split(',').map((catId, idx) => ({
        id: parseInt(catId, 10),
        title: post.category_titles.split(',')[idx]
      })) : [],
      images: images.map(img => img.image_path)
    };
  }

  /**
   * Create new post
   */
  async create({ author_id, title, content, categories = [], images = [] }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.query(
        `INSERT INTO posts (author_id, title, content, status) VALUES (?, ?, ?, 'active');`,
        [author_id, title, content]
      );
      const postId = result.insertId;

      if (categories && categories.length > 0) {
        for (const catId of categories) {
          await connection.query(
            `INSERT INTO post_categories (post_id, category_id) VALUES (?, ?);`,
            [postId, catId]
          );
        }
      }

      if (images && images.length > 0) {
        for (const imgPath of images) {
          await connection.query(
            `INSERT INTO post_images (post_id, image_path) VALUES (?, ?);`,
            [postId, imgPath]
          );
        }
      }

      await connection.commit();
      return postId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update post (title, content, categories)
   */
  async update(id, { title, content, categories }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const fields = [];
      const values = [];

      if (title !== undefined) {
        fields.push('title = ?');
        values.push(title);
      }
      if (content !== undefined) {
        fields.push('content = ?');
        values.push(content);
      }

      if (fields.length > 0) {
        values.push(id);
        await connection.query(
          `UPDATE posts SET ${fields.join(', ')} WHERE id = ?;`,
          values
        );
      }

      if (categories !== undefined && Array.isArray(categories)) {
        await connection.query(`DELETE FROM post_categories WHERE post_id = ?;`, [id]);
        for (const catId of categories) {
          await connection.query(
            `INSERT INTO post_categories (post_id, category_id) VALUES (?, ?);`,
            [id, catId]
          );
        }
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update post status (active / inactive - Admin lock function)
   */
  async updateStatus(id, status) {
    const [result] = await pool.query(
      `UPDATE posts SET status = ? WHERE id = ?;`,
      [status, id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Delete post
   */
  async delete(id) {
    const [result] = await pool.query(
      `DELETE FROM posts WHERE id = ?;`,
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new PostRepository();
