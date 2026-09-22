const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

async function seedDatabase() {
  let connection;
  try {
    console.log('Starting Database Seeding...');
    connection = await pool.getConnection();

    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
    await connection.query('TRUNCATE TABLE post_subscriptions;');
    await connection.query('TRUNCATE TABLE notifications;');
    await connection.query('TRUNCATE TABLE post_images;');
    await connection.query('TRUNCATE TABLE likes;');
    await connection.query('TRUNCATE TABLE comments;');
    await connection.query('TRUNCATE TABLE post_categories;');
    await connection.query('TRUNCATE TABLE posts;');
    await connection.query('TRUNCATE TABLE categories;');
    await connection.query('TRUNCATE TABLE favorites;');
    await connection.query('TRUNCATE TABLE users;');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Seed Users
    const users = [
      ['admin', hashedPassword, 'Admin User', 'admin@usof.local', 1, 'admin', 0],
      ['johndoe', hashedPassword, 'John Doe', 'john@example.com', 1, 'user', 0],
      ['janesmith', hashedPassword, 'Jane Smith', 'jane@example.com', 1, 'user', 0],
      ['alexcode', hashedPassword, 'Alex Developer', 'alex@example.com', 1, 'user', 0],
      ['emilyw', hashedPassword, 'Emily Watson', 'emily@example.com', 1, 'user', 0]
    ];

    for (const u of users) {
      await connection.query(
        `INSERT INTO users (login, password, full_name, email, is_email_confirmed, role, rating) VALUES (?, ?, ?, ?, ?, ?, ?);`,
        u
      );
    }

    // 2. Seed Categories
    const categories = [
      ['JavaScript', 'All about modern JavaScript, ES6+, and async programming.'],
      ['Node.js & Express', 'Backend development, web servers, and middleware.'],
      ['MySQL & Databases', 'Database design, SQL queries, indexing, and performance.'],
      ['Architecture & SOLID', 'Design patterns, clean code, MVC, and SOLID principles.'],
      ['General Discussions', 'General tech questions, career advice, and project reviews.']
    ];

    for (const c of categories) {
      await connection.query(
        `INSERT INTO categories (title, description) VALUES (?, ?);`,
        c
      );
    }

    // 3. Seed Posts
    const posts = [
      [1, 'Welcome to USOF Platform!', 'This is the official announcement for the USOF backend platform. Ask questions and share knowledge!', 'active'],
      [2, 'How to structure Node.js apps with MVC & SOLID?', 'What are the best practices for separating controllers, services, and repositories in Node.js?', 'active'],
      [3, 'Understanding MySQL Connection Pools', 'Why should we use connection pools in mysql2/promise instead of single connections?', 'active'],
      [4, 'JavaScript Async/Await vs Promises', 'Can someone explain error handling best practices when using async/await?', 'active'],
      [5, 'Drafting a new project requirement', 'This is an internal locked post testing inactive status visibility.', 'inactive']
    ];

    for (const p of posts) {
      await connection.query(
        `INSERT INTO posts (author_id, title, content, status) VALUES (?, ?, ?, ?);`,
        p
      );
    }

    // 4. Seed Post_Categories
    const postCategories = [
      [1, 5],
      [2, 2],
      [2, 4],
      [3, 3],
      [4, 1],
      [5, 4]
    ];

    for (const pc of postCategories) {
      await connection.query(
        `INSERT INTO post_categories (post_id, category_id) VALUES (?, ?);`,
        pc
      );
    }

    // 5. Seed Comments
    const comments = [
      [2, 1, 'Great to see this platform launched!'],
      [3, 2, 'Layering controllers, services, and repositories makes code much easier to test.'],
      [4, 3, 'Pools manage multiple concurrent requests without overwhelming the database.'],
      [5, 4, 'Always use try/catch blocks or a central error-handling middleware!'],
      [1, 2, 'Thank you for the detailed discussion!']
    ];

    for (const com of comments) {
      await connection.query(
        `INSERT INTO comments (author_id, post_id, content) VALUES (?, ?, ?);`,
        com
      );
    }

    // 6. Seed Likes
    const likes = [
      [2, 'post', 1, 'like'],
      [3, 'post', 1, 'like'],
      [4, 'post', 2, 'like'],
      [5, 'post', 2, 'dislike'],
      [1, 'comment', 2, 'like']
    ];

    for (const l of likes) {
      await connection.query(
        `INSERT INTO likes (author_id, target_type, target_id, type) VALUES (?, ?, ?, ?);`,
        l
      );
    }

    // 7. Update User Ratings based on seed likes
    await connection.query(`
      UPDATE users u
      SET rating = (
        (SELECT COUNT(*) FROM likes l 
         JOIN posts p ON l.target_type = 'post' AND l.target_id = p.id 
         WHERE p.author_id = u.id AND l.type = 'like')
        +
        (SELECT COUNT(*) FROM likes l 
         JOIN comments c ON l.target_type = 'comment' AND l.target_id = c.id 
         WHERE c.author_id = u.id AND l.type = 'like')
        -
        (SELECT COUNT(*) FROM likes l 
         JOIN posts p ON l.target_type = 'post' AND l.target_id = p.id 
         WHERE p.author_id = u.id AND l.type = 'dislike')
        -
        (SELECT COUNT(*) FROM likes l 
         JOIN comments c ON l.target_type = 'comment' AND l.target_id = c.id 
         WHERE c.author_id = u.id AND l.type = 'dislike')
      );
    `);

    console.log('Database Seeding Completed Successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

if (require.main === module) {
  seedDatabase().then(() => process.exit(0));
}

module.exports = seedDatabase;
