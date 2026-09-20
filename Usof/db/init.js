const { createServerConnection, pool } = require('../config/db');
require('dotenv').config();

async function initDatabase() {
  let connection;
  try {
    console.log('Starting Database Initialization...');
    connection = await createServerConnection();

    const dbName = process.env.DB_NAME || 'usof_db';

    // 1. Create Database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${dbName}\`;`);

    // 2. Create Users Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        login VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        is_email_confirmed TINYINT(1) NOT NULL DEFAULT 0,
        confirm_token VARCHAR(255) NULL,
        reset_token VARCHAR(255) NULL,
        reset_token_expires DATETIME NULL,
        profile_picture VARCHAR(255) DEFAULT 'default-avatar.png',
        rating INT NOT NULL DEFAULT 0,
        role ENUM('admin', 'user', 'guest') NOT NULL DEFAULT 'user',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Ensure role ENUM in users table is updated if table already existed
    try {
      await connection.query(`ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'user', 'guest') NOT NULL DEFAULT 'user';`);
    } catch (e) {
      // Ignore if table does not exist yet or alter fails safely
    }

    // 3. Create Posts Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        author_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
        publish_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Create Categories Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(100) UNIQUE NOT NULL,
        description TEXT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. Create Post_Categories Table (Many-to-Many)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS post_categories (
        post_id INT NOT NULL,
        category_id INT NOT NULL,
        PRIMARY KEY (post_id, category_id),
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 6. Create Comments Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        author_id INT NOT NULL,
        post_id INT NOT NULL,
        content TEXT NOT NULL,
        status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
        publish_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 7. Create Likes Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS likes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        author_id INT NOT NULL,
        target_type ENUM('post', 'comment') NOT NULL,
        target_id INT NOT NULL,
        type ENUM('like', 'dislike') NOT NULL,
        publish_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_author_target (author_id, target_type, target_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 8. Create Favorites Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        user_id INT NOT NULL,
        post_id INT NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, post_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 9. Create Post Subscriptions Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS post_subscriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        post_id INT NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_post (user_id, post_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 10. Create Notifications Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        message TEXT NOT NULL,
        is_read TINYINT(1) DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 11. Create Post Images Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS post_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        image_path VARCHAR(255) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 12. Create Sessions Table for express-mysql-session
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        session_id VARCHAR(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
        expires INT(11) UNSIGNED NOT NULL,
        data MEDIUMTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
        PRIMARY KEY (session_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('Database Initialization Completed Successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;
