const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'usof_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
};

// Create a pool for application database queries
const pool = mysql.createPool(dbConfig);

// Helper function to create a connection without database selection (used during DB initialization)
async function createServerConnection() {
  return await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    dateStrings: true
  });
}

module.exports = {
  pool,
  dbConfig,
  createServerConnection
};
