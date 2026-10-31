const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

async function seedDatabase() {
  let connection;
  try {
    console.log('Starting Database Seeding...');
    connection = await pool.getConnection();

    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
    await connection.query('TRUNCATE TABLE sessions;');
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

    // 1. Seed Users (5 entries)
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

    // 2. Seed Categories (10 entries)
    const categories = [
      ['JavaScript', 'All about modern JavaScript, ES6+, and async programming.'],
      ['Node.js & Express', 'Backend development, web servers, and middleware.'],
      ['MySQL & Databases', 'Database design, SQL queries, indexing, and performance.'],
      ['Architecture & SOLID', 'Design patterns, clean code, MVC, and SOLID principles.'],
      ['General Discussions', 'General tech questions, career advice, and project reviews.'],
      ['React & Frontend', 'Component lifecycle, hooks, state management, and modern frontend tools.'],
      ['TypeScript', 'Static typing, interfaces, generics, and compiler configurations for JavaScript.'],
      ['Docker & DevOps', 'Containerization, CI/CD pipelines, Dockerfiles, and cloud deployment workflows.'],
      ['REST & GraphQL APIs', 'API design, HTTP methods, status codes, query schemas, and API security.'],
      ['Git & Version Control', 'Branching strategies, merge conflicts, pull requests, and Git workflows.']
    ];

    for (const c of categories) {
      await connection.query(
        `INSERT INTO categories (title, description) VALUES (?, ?);`,
        c
      );
    }

    // 3. Seed Posts (5 entries)
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

    // 4. Seed Post_Categories (6 entries)
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

    // 5. Seed Comments (6 entries: 5 active, 1 inactive, with parent_id reply nesting)
    const comments = [
      [null, 2, 1, 'Great to see this platform launched!', 'active'],
      [null, 3, 2, 'Layering controllers, services, and repositories makes code much easier to test.', 'active'],
      [null, 4, 3, 'Pools manage multiple concurrent requests without overwhelming the database.', 'active'],
      [null, 5, 4, 'Always use try/catch blocks or a central error-handling middleware!', 'active'],
      [2, 1, 2, 'Thank you for the detailed discussion!', 'active'],
      [null, 2, 2, 'This is an inactive comment that is visible to users per checklist specifications.', 'inactive']
    ];

    for (const com of comments) {
      await connection.query(
        `INSERT INTO comments (parent_id, author_id, post_id, content, status) VALUES (?, ?, ?, ?, ?);`,
        com
      );
    }

    // 6. Seed Likes (6 entries)
    const likes = [
      [2, 'post', 1, 'like'],
      [3, 'post', 1, 'like'],
      [4, 'post', 2, 'like'],
      [5, 'post', 2, 'dislike'],
      [1, 'comment', 2, 'like'],
      [3, 'comment', 1, 'like']
    ];

    for (const l of likes) {
      await connection.query(
        `INSERT INTO likes (author_id, target_type, target_id, type) VALUES (?, ?, ?, ?);`,
        l
      );
    }

    // 7. Seed Favorites (7 entries)
    const favorites = [
      [1, 2],
      [1, 3],
      [2, 3],
      [3, 1],
      [3, 2],
      [4, 1],
      [5, 2]
    ];

    for (const f of favorites) {
      await connection.query(
        `INSERT INTO favorites (user_id, post_id) VALUES (?, ?);`,
        f
      );
    }

    // 8. Seed Post Subscriptions (7 entries)
    const postSubscriptions = [
      [1, 2],
      [2, 1],
      [2, 3],
      [4, 1],
      [4, 2],
      [5, 1],
      [5, 2]
    ];

    for (const ps of postSubscriptions) {
      await connection.query(
        `INSERT INTO post_subscriptions (user_id, post_id) VALUES (?, ?);`,
        ps
      );
    }

    // 9. Seed Notifications (6 entries)
    const notifications = [
      [1, 'Welcome to USOF! Your administrator account is ready.', 1],
      [2, 'New comment on your post "How to structure Node.js apps with MVC & SOLID?"', 0],
      [3, 'Alex Developer liked your comment on post 2.', 0],
      [4, 'Welcome to the USOF developer community!', 1],
      [5, 'You have successfully subscribed to post updates for "Understanding MySQL Connection Pools".', 0],
      [2, 'Jane Smith favorited your post "How to structure Node.js apps with MVC & SOLID?".', 1]
    ];

    for (const n of notifications) {
      await connection.query(
        `INSERT INTO notifications (user_id, message, is_read) VALUES (?, ?, ?);`,
        n
      );
    }

    // 10. Seed Post Images (6 entries)
    const postImages = [
      [1, '/uploads/posts/welcome-banner.png'],
      [2, '/uploads/posts/mvc-architecture-diagram.png'],
      [2, '/uploads/posts/solid-principles-mindmap.png'],
      [3, '/uploads/posts/mysql-connection-pool.png'],
      [4, '/uploads/posts/async-await-flow.png'],
      [5, '/uploads/posts/project-specifications.png']
    ];

    for (const pi of postImages) {
      await connection.query(
        `INSERT INTO post_images (post_id, image_path) VALUES (?, ?);`,
        pi
      );
    }

    // 11. Seed Sessions (5 entries)
    const expireTimestamp = Math.floor(Date.now() / 1000) + 86400 * 30; // 30 days
    const expireIso = new Date(Date.now() + 86400000 * 30).toISOString();

    const seededSessions = [
      {
        id: 'session_seed_admin_01',
        user: { id: 1, login: 'admin', full_name: 'Admin User', email: 'admin@usof.local', role: 'admin', profile_picture: 'default-avatar.png', rating: 0 }
      },
      {
        id: 'session_seed_johndoe_02',
        user: { id: 2, login: 'johndoe', full_name: 'John Doe', email: 'john@example.com', role: 'user', profile_picture: 'default-avatar.png', rating: 0 }
      },
      {
        id: 'session_seed_janesmith_03',
        user: { id: 3, login: 'janesmith', full_name: 'Jane Smith', email: 'jane@example.com', role: 'user', profile_picture: 'default-avatar.png', rating: 0 }
      },
      {
        id: 'session_seed_alexcode_04',
        user: { id: 4, login: 'alexcode', full_name: 'Alex Developer', email: 'alex@example.com', role: 'user', profile_picture: 'default-avatar.png', rating: 0 }
      },
      {
        id: 'session_seed_emilyw_05',
        user: { id: 5, login: 'emilyw', full_name: 'Emily Watson', email: 'emily@example.com', role: 'user', profile_picture: 'default-avatar.png', rating: 0 }
      }
    ];

    for (const s of seededSessions) {
      const sessionData = JSON.stringify({
        cookie: {
          originalMaxAge: 86400000,
          expires: expireIso,
          httpOnly: true,
          path: '/'
        },
        user: s.user
      });

      await connection.query(
        `INSERT INTO sessions (session_id, expires, data) VALUES (?, ?, ?);`,
        [s.id, expireTimestamp, sessionData]
      );
    }

    // 12. Update User Ratings based on seed likes
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

    console.log('Database Seeding Completed Successfully! All tables have at least 5 entries.');
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
