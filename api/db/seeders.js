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

    // 1. Seed Users (5 accounts)
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

    // 2. Seed Categories (10 categories)
    const categories = [
      ['General Discussions', 'General tech questions, career advice, and project reviews.'],
      ['JavaScript', 'All about modern JavaScript, ES6+, and async programming.'],
      ['Node.js & Express', 'Backend development, web servers, and middleware.'],
      ['MySQL & Databases', 'Database design, SQL queries, indexing, and performance.'],
      ['Architecture & SOLID', 'Design patterns, clean code, MVC, and SOLID principles.'],
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

    // 3. Seed Posts (10 diverse questions across the 5 users)
    const posts = [
      [
        1,
        'Welcome to the USOF Developer Community!',
        'Welcome everyone to USOF! This platform is designed for asking deep technical questions, sharing clean code patterns, and helping each other grow as engineers. Please check our Guidelines and feel free to start discussions.',
        'active'
      ],
      [
        2,
        'How to structure Node.js apps with MVC & Clean Architecture?',
        'What are the industry best practices for decoupling controllers, domain services, and repository layers in Express? How do you prevent business logic from leaking into HTTP controllers?',
        'active'
      ],
      [
        3,
        'Optimizing MySQL Connection Pools & Slow Queries',
        'We are experiencing high database latency during peak traffic spikes. How should connection pool limits (e.g. connectionLimit: 20 vs 100 in mysql2) be tuned alongside composite indexing in InnoDB?',
        'active'
      ],
      [
        4,
        'TypeScript Strict Mode vs Regular JavaScript in Large Codebases',
        'When migrating an existing enterprise codebase from vanilla JavaScript to TypeScript, what strict compiler options (noImplicitAny, strictNullChecks) provide the highest ROI with minimal friction?',
        'active'
      ],
      [
        5,
        'React 18 Concurrent Rendering & State Management with Redux Toolkit',
        'How does React 18 automatic batching affect Redux Toolkit slice updates? Are there scenarios where useTransition or useDeferredValue should be combined with async thunks for smoother UI transitions?',
        'active'
      ],
      [
        2,
        'Docker Multi-stage Builds for Lean Production Node.js Containers',
        'What is the recommended multi-stage Dockerfile pattern to separate build tools, prune devDependencies, and run under a non-root user for security in production environments?',
        'active'
      ],
      [
        3,
        'Designing Resilient RESTful APIs with Idempotency & Rate Limiting',
        'How do you handle network retry storms on payment or mutating endpoints? Is using an Idempotency-Key header backed by Redis or MySQL the standard approach in REST API architecture?',
        'active'
      ],
      [
        4,
        'Git Merge vs Rebase: Team Workflows and Clean Commit Histories',
        'Should feature branches always be rebased onto main, or is squash-merge via Pull Requests preferable for tracking release features and avoiding messy branch diagrams?',
        'active'
      ],
      [
        5,
        'Modern CSS Architecture: Custom Properties vs CSS Modules',
        'With native CSS variables now offering dynamic runtime theme switching without extra bundler runtime, what is the best strategy for organizing large-scale design tokens and dark/light modes?',
        'active'
      ],
      [
        2,
        'Benchmarking Microservices vs Modular Monolith',
        'Work in progress draft comparing latency, operational complexity, and deployment overhead of microservices compared to a modular monolith with strict domain boundaries.',
        'active'
      ]
    ];

    for (const p of posts) {
      await connection.query(
        `INSERT INTO posts (author_id, title, content, status) VALUES (?, ?, ?, ?);`,
        p
      );
    }

    // 4. Seed Post_Categories (Category associations for all 10 posts)
    const postCategories = [
      [1, 1],   // Post 1: General Discussions
      [2, 3],   // Post 2: Node.js & Express
      [2, 5],   // Post 2: Architecture & SOLID
      [3, 4],   // Post 3: MySQL & Databases
      [4, 2],   // Post 4: JavaScript
      [4, 7],   // Post 4: TypeScript
      [5, 6],   // Post 5: React & Frontend
      [6, 3],   // Post 6: Node.js & Express
      [6, 8],   // Post 6: Docker & DevOps
      [7, 5],   // Post 7: Architecture & SOLID
      [7, 9],   // Post 7: REST & GraphQL APIs
      [8, 10],  // Post 8: Git & Version Control
      [9, 6],   // Post 9: React & Frontend
      [9, 1],   // Post 9: General Discussions
      [10, 5],  // Post 10: Architecture & SOLID
      [10, 8]   // Post 10: Docker & DevOps
    ];

    for (const pc of postCategories) {
      await connection.query(
        `INSERT INTO post_categories (post_id, category_id) VALUES (?, ?);`,
        pc
      );
    }

    // 5. Seed Comments (16 comments with threaded nested replies and active/inactive statuses)
    const comments = [
      [null, 2, 1, 'Excited to be part of the community! Looking forward to great technical discussions.', 'active'],
      [null, 3, 1, 'The dark theme and interface look incredible. Kudos to the creators!', 'active'],
      [2, 1, 1, 'Glad to hear that, Jane! Let us know if you have any feature feedback or suggestions.', 'active'],
      [null, 3, 2, 'In our engineering team, controllers only validate DTOs and delegate directly to service classes.', 'active'],
      [null, 4, 2, 'The Repository Pattern with raw parameterized SQL avoids ORM overhead and N+1 query surprises.', 'active'],
      [5, 2, 2, 'Exactly my thoughts, Alex! Keeping business rules independent of data access is a game-changer.', 'active'],
      [null, 4, 3, 'Always calibrate connectionLimit to your CPU cores and available MySQL RAM. 15 to 25 is usually the sweet spot.', 'active'],
      [7, 3, 3, 'Thanks Alex, we tested with connectionLimit: 25 and saw an immediate 40% latency reduction under load.', 'active'],
      [null, 5, 4, 'Starting with "noImplicitAny: true" and gradually enabling "strictNullChecks" worked best for our team.', 'active'],
      [null, 2, 4, 'TypeScript generics take a few days to master, but the compile-time safety prevents countless runtime bugs.', 'active'],
      [null, 4, 5, 'useDeferredValue is fantastic when filtering large question lists without blocking immediate keystrokes.', 'active'],
      [11, 5, 5, 'Yes! Combined with a debounced Redux search filter, the UI responsiveness feels instant.', 'active'],
      [null, 3, 6, 'Make sure to use Alpine Linux or Distroless images to keep your Node container footprint under 120MB.', 'active'],
      [null, 1, 7, 'Idempotency keys with Redis or MySQL TTL of 24h work reliably for payment and mutation endpoints.', 'active'],
      [null, 5, 8, 'Squash and merge keeps the main branch history clean, atomic, and bisect-friendly for release tracking.', 'active'],
      [null, 2, 2, 'This is a sample moderated comment demonstrating the inactive status badge.', 'inactive']
    ];

    for (const com of comments) {
      await connection.query(
        `INSERT INTO comments (parent_id, author_id, post_id, content, status) VALUES (?, ?, ?, ?, ?);`,
        com
      );
    }

    // 6. Seed Likes (25 likes/dislikes on posts and comments for diverse ratings)
    const likes = [
      // Post 1 (Welcome) -> 4 likes
      [2, 'post', 1, 'like'],
      [3, 'post', 1, 'like'],
      [4, 'post', 1, 'like'],
      [5, 'post', 1, 'like'],

      // Post 2 (MVC & SOLID) -> 3 likes, 1 dislike = score 2
      [1, 'post', 2, 'like'],
      [3, 'post', 2, 'like'],
      [4, 'post', 2, 'like'],
      [5, 'post', 2, 'dislike'],

      // Post 3 (MySQL Pools) -> 3 likes
      [1, 'post', 3, 'like'],
      [2, 'post', 3, 'like'],
      [4, 'post', 3, 'like'],

      // Post 4 (TypeScript) -> 3 likes
      [2, 'post', 4, 'like'],
      [3, 'post', 4, 'like'],
      [5, 'post', 4, 'like'],

      // Post 5 (React 18) -> 3 likes
      [1, 'post', 5, 'like'],
      [3, 'post', 5, 'like'],
      [4, 'post', 5, 'like'],

      // Post 6 (Docker) -> 2 likes, 1 dislike = score 1
      [3, 'post', 6, 'like'],
      [5, 'post', 6, 'like'],
      [4, 'post', 6, 'dislike'],

      // Post 7 (REST APIs) -> 3 likes
      [1, 'post', 7, 'like'],
      [2, 'post', 7, 'like'],
      [4, 'post', 7, 'like'],

      // Post 8 (Git) -> 2 likes
      [2, 'post', 8, 'like'],
      [5, 'post', 8, 'like'],

      // Post 9 (Modern CSS) -> 3 likes
      [1, 'post', 9, 'like'],
      [2, 'post', 9, 'like'],
      [3, 'post', 9, 'like'],

      // Comments likes
      [1, 'comment', 1, 'like'],
      [2, 'comment', 4, 'like'],
      [4, 'comment', 4, 'like'],
      [3, 'comment', 7, 'like'],
      [5, 'comment', 7, 'like'],
      [5, 'comment', 11, 'like'],
      [2, 'comment', 13, 'like']
    ];

    for (const l of likes) {
      await connection.query(
        `INSERT INTO likes (author_id, target_type, target_id, type) VALUES (?, ?, ?, ?);`,
        l
      );
    }

    // 7. Seed Favorites (14 entries across users and questions)
    const favorites = [
      [1, 2],
      [1, 3],
      [1, 7],
      [2, 1],
      [2, 3],
      [2, 5],
      [3, 1],
      [3, 2],
      [3, 4],
      [4, 2],
      [4, 6],
      [5, 2],
      [5, 5],
      [5, 8]
    ];

    for (const f of favorites) {
      await connection.query(
        `INSERT INTO favorites (user_id, post_id) VALUES (?, ?);`,
        f
      );
    }

    // 8. Seed Post Subscriptions (13 entries)
    const postSubscriptions = [
      [1, 2],
      [1, 6],
      [2, 1],
      [2, 3],
      [2, 7],
      [3, 1],
      [3, 2],
      [4, 1],
      [4, 3],
      [4, 5],
      [5, 1],
      [5, 4],
      [5, 6]
    ];

    for (const ps of postSubscriptions) {
      await connection.query(
        `INSERT INTO post_subscriptions (user_id, post_id) VALUES (?, ?);`,
        ps
      );
    }

    // 9. Seed Notifications (8 entries)
    const notifications = [
      [1, 'Welcome to USOF! Your administrator account is ready.', 1],
      [2, 'New comment on your post "How to structure Node.js apps with MVC & Clean Architecture?"', 0],
      [3, 'Alex Developer liked your question on MySQL Connection Pools.', 0],
      [4, 'Welcome to the USOF developer community!', 1],
      [5, 'You have successfully subscribed to updates for "React 18 Concurrent Rendering".', 0],
      [2, 'Jane Smith favorited your question on Docker Multi-stage Builds.', 1],
      [3, 'Admin User left a reply to your comment.', 0],
      [4, 'Emily Watson liked your comment on TypeScript strict mode.', 0]
    ];

    for (const n of notifications) {
      await connection.query(
        `INSERT INTO notifications (user_id, message, is_read) VALUES (?, ?, ?);`,
        n
      );
    }

    // 10. Seed Post Images (10 entries matching the questions)
    const postImages = [
      [1, '/uploads/posts/welcome-banner.jpg'],
      [2, '/uploads/posts/programming.jpg'],
      [2, '/uploads/posts/matrix.jpg'],
      [3, '/uploads/posts/programming.jpg'],
      [4, '/uploads/posts/matrix.jpg'],
      [5, '/uploads/posts/programming.jpg'],
      [6, '/uploads/posts/matrix.jpg'],
      [7, '/uploads/posts/programming.jpg'],
      [8, '/uploads/posts/matrix.jpg'],
      [10, '/uploads/posts/programming.jpg']
    ];

    for (const pi of postImages) {
      await connection.query(
        `INSERT INTO post_images (post_id, image_path) VALUES (?, ?);`,
        pi
      );
    }

    // 11. Seed Sessions (5 entries for persistent pre-auth)
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

    // 12. Update User Ratings dynamically based on seed likes
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
