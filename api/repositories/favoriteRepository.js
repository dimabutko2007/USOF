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
              (SELECT COALESCE(SUM(CASE WHEN l.type = 'like' THEN 1 WHEN l.type = 'dislike' THEN -1 ELSE 0 END), 0) FROM likes l WHERE l.target_type = 'post' AND l.target_id = p.id) AS likes_count,
              (SELECT COUNT(*) FROM comments c2 WHERE c2.post_id = p.id) AS comments_count,
              (SELECT l2.type FROM likes l2 WHERE l2.target_type = 'post' AND l2.target_id = p.id AND l2.author_id = ?) AS user_reaction,
              GROUP_CONCAT(DISTINCT c.id) AS category_ids,
              GROUP_CONCAT(DISTINCT c.title) AS category_titles
       FROM favorites f
       JOIN posts p ON f.post_id = p.id
       JOIN users u ON p.author_id = u.id
       LEFT JOIN post_categories pc ON p.id = pc.post_id
       LEFT JOIN categories c ON pc.category_id = c.id
       WHERE f.user_id = ? AND p.status = 'active'
       GROUP BY p.id
       ORDER BY f.created_at DESC;`,
      [userId, userId]
    );

    if (rows.length === 0) return [];

    const postIds = rows.map((r) => r.id);
    const [images] = await pool.query(
      `SELECT post_id, image_path FROM post_images WHERE post_id IN (${postIds.map(() => '?').join(',')})`,
      postIds
    );
    const imagesMap = {};
    images.forEach((img) => {
      if (!imagesMap[img.post_id]) imagesMap[img.post_id] = [];
      imagesMap[img.post_id].push(img.image_path);
    });

    return rows.map((post) => ({
      ...post,
      comments_count: parseInt(post.comments_count || 0, 10),
      categories: post.category_ids
        ? post.category_ids.split(',').map((id, idx) => ({
            id: parseInt(id, 10),
            title: post.category_titles ? post.category_titles.split(',')[idx] : '',
          }))
        : [],
      images: imagesMap[post.id] || [],
    }));
  }
}

module.exports = new FavoriteRepository();
