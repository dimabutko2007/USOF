const { pool } = require('../config/db');

class PostRepository {
  async findAll({ page = 1, limit = 10, sort = 'likes', categories, startDate, endDate, status, search }, currentUser = null) {
    const offset = (page - 1) * limit;
    const whereConditions = [];
    const params = [];

    const currentUserId = currentUser ? currentUser.id : null;

    if (!currentUser) {
      whereConditions.push(`p.status = 'active'`);
    } else if (currentUser.role === 'admin') {
      if (status) {
        whereConditions.push(`p.status = ?`);
        params.push(status);
      }
    } else {
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

    const searchTerm = search && search.trim() ? search.trim() : null;
    const searchTokens = searchTerm ? searchTerm.split(/\s+/).filter(Boolean) : [];

    if (searchTerm && searchTokens.length > 0) {
      const tokenWhere = searchTokens
        .map(() => `(p.title LIKE ? OR p.content LIKE ? OR EXISTS (
          SELECT 1 FROM post_categories pc2 JOIN categories c2 ON pc2.category_id = c2.id
          WHERE pc2.post_id = p.id AND c2.title LIKE ?
        ))`)
        .join(' OR ');
      whereConditions.push(`(${tokenWhere})`);
      for (const token of searchTokens) {
        const likeTerm = `%${token}%`;
        params.push(likeTerm, likeTerm, likeTerm);
      }
    }

    if (categories) {
      const catList = Array.isArray(categories) ? categories : categories.split(',').map(c => c.trim());
      if (catList.length > 0) {
        whereConditions.push(`p.id IN (SELECT post_id FROM post_categories WHERE category_id IN (${catList.map(() => '?').join(',')}))`);
        params.push(...catList);
      }
    }

    if (startDate) {
      whereConditions.push(`p.publish_date >= ?`);
      params.push(startDate);
    }
    if (endDate) {
      whereConditions.push(`p.publish_date <= ?`);
      params.push(endDate);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    let relevanceSelect = '';
    let orderByClause;
    const selectParams = [];

    if (searchTerm) {
      const cases = [];
      const addParam = (value) => selectParams.push(value);

      cases.push(`CASE WHEN p.title = ? THEN 50 ELSE 0 END`);
      addParam(searchTerm);
      cases.push(`CASE WHEN p.title LIKE ? THEN 25 ELSE 0 END`);
      addParam(`${searchTerm}%`);
      cases.push(`CASE WHEN EXISTS (
        SELECT 1 FROM post_categories pc2 JOIN categories c2 ON pc2.category_id = c2.id
        WHERE pc2.post_id = p.id AND c2.title = ?
      ) THEN 35 ELSE 0 END`);
      addParam(searchTerm);

      for (const token of searchTokens) {
        cases.push(`CASE WHEN p.title LIKE ? THEN 10 ELSE 0 END`);
        addParam(`%${token}%`);
        cases.push(`CASE WHEN p.content LIKE ? THEN 3 ELSE 0 END`);
        addParam(`%${token}%`);
        cases.push(`CASE WHEN EXISTS (
          SELECT 1 FROM post_categories pc2 JOIN categories c2 ON pc2.category_id = c2.id
          WHERE pc2.post_id = p.id AND c2.title LIKE ?
        ) THEN 8 ELSE 0 END`);
        addParam(`%${token}%`);
      }

      relevanceSelect = `, (${cases.join(' + ')}) AS relevance`;
      orderByClause = `ORDER BY relevance DESC, likes_count DESC, p.publish_date DESC`;
    } else {
      if (sort === 'date') {
        orderByClause = `ORDER BY p.publish_date DESC`;
      } else {
        orderByClause = `ORDER BY likes_count DESC, p.publish_date DESC`;
      }
    }

    // 🔴 ЗМІНЕНО: l2.author_id замість l2.user_id
    const sql = `
      SELECT p.id, p.author_id, u.login AS author_login, u.profile_picture AS author_avatar,
             p.title, p.content, p.status, p.publish_date,
             (SELECT COALESCE(SUM(CASE WHEN l.type = 'like' THEN 1 WHEN l.type = 'dislike' THEN -1 ELSE 0 END), 0) FROM likes l WHERE l.target_type = 'post' AND l.target_id = p.id) AS likes_count,
             (SELECT COUNT(*) FROM comments c2 WHERE c2.post_id = p.id) AS comments_count,
             (SELECT l2.type FROM likes l2 WHERE l2.target_type = 'post' AND l2.target_id = p.id AND l2.author_id = ?) AS user_reaction,
             GROUP_CONCAT(DISTINCT c.id) AS category_ids,
             GROUP_CONCAT(DISTINCT c.title) AS category_titles
             ${relevanceSelect}
      FROM posts p
      JOIN users u ON p.author_id = u.id
      LEFT JOIN post_categories pc ON p.id = pc.post_id
      LEFT JOIN categories c ON pc.category_id = c.id
      ${whereClause}
      GROUP BY p.id
      ${orderByClause}
      LIMIT ? OFFSET ?;
    `;

    const queryParams = [currentUserId, ...selectParams, ...params, parseInt(limit, 10), parseInt(offset, 10)];
    const [rows] = await pool.query(sql, queryParams);

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

    return rows.map(post => ({
      ...post,
      comments_count: parseInt(post.comments_count || 0, 10),
      categories: post.category_ids ? post.category_ids.split(',').map((id, idx) => ({
        id: parseInt(id, 10),
        title: post.category_titles ? post.category_titles.split(',')[idx] : ''
      })) : [],
      images: imagesMap[post.id] || []
    }));
  }

  async findById(id, currentUser = null) {
    const currentUserId = currentUser ? currentUser.id : null;
    // 🔴 ЗМІНЕНО: l2.author_id замість l2.user_id
    const sql = `
      SELECT p.id, p.author_id, u.login AS author_login, u.profile_picture AS author_avatar,
             p.title, p.content, p.status, p.publish_date,
             (SELECT COALESCE(SUM(CASE WHEN l.type = 'like' THEN 1 WHEN l.type = 'dislike' THEN -1 ELSE 0 END), 0) FROM likes l WHERE l.target_type = 'post' AND l.target_id = p.id) AS likes_count,
             (SELECT COUNT(*) FROM comments c2 WHERE c2.post_id = p.id) AS comments_count,
             (SELECT l2.type FROM likes l2 WHERE l2.target_type = 'post' AND l2.target_id = p.id AND l2.author_id = ?) AS user_reaction,
             GROUP_CONCAT(DISTINCT c.id) AS category_ids,
             GROUP_CONCAT(DISTINCT c.title) AS category_titles
      FROM posts p
      JOIN users u ON p.author_id = u.id
      LEFT JOIN post_categories pc ON p.id = pc.post_id
      LEFT JOIN categories c ON pc.category_id = c.id
      WHERE p.id = ?
      GROUP BY p.id;
    `;
    const [rows] = await pool.query(sql, [currentUserId, id]);
    if (!rows[0]) return null;

    const post = rows[0];

    const [images] = await pool.query(
      `SELECT image_path FROM post_images WHERE post_id = ?`,
      [id]
    );

    return {
      ...post,
      comments_count: parseInt(post.comments_count || 0, 10),
      categories: post.category_ids ? post.category_ids.split(',').map((catId, idx) => ({
        id: parseInt(catId, 10),
        title: post.category_titles ? post.category_titles.split(',')[idx] : ''
      })) : [],
      images: images.map(img => img.image_path)
    };
  }

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

  async updateStatus(id, status) {
    const [result] = await pool.query(
      `UPDATE posts SET status = ? WHERE id = ?;`,
      [status, id]
    );
    return result.affectedRows > 0;
  }

  async delete(id) {
    const [result] = await pool.query(
      `DELETE FROM posts WHERE id = ?;`,
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new PostRepository();
