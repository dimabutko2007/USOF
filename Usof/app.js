const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const path = require('path');
require('dotenv').config();

const { dbConfig } = require('./config/db');
const { errorHandler, ApiError } = require('./middlewares/errorMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const standaloneCommentRoutes = require('./routes/standaloneCommentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { postLikeRouter, commentLikeRouter } = require('./routes/likeRoutes');
const { postFavoriteRouter, userFavoritesRouter } = require('./routes/favoriteRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded static files (avatars, images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MySQL Session Store configuration
const sessionStore = new MySQLStore({
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  clearExpired: true,
  checkExpirationInterval: 900000,
  expiration: 86400000, // 24 hours
  createDatabaseTable: true
});

// Configure Express Session with Cookie
app.use(
  session({
    key: 'usof_sid',
    secret: process.env.SESSION_SECRET || 'usof_secret_key_2026',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true if using HTTPS in production
      maxAge: 86400000 // 24 hours
    }
  })
);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'USOF API Server is running smoothly.' });
});

// API Module Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);

// Post routes & nested resources
app.use('/api/posts', postRoutes);
app.use('/api/posts/:post_id/comments', commentRoutes);
app.use('/api/posts/:post_id/like', postLikeRouter);
app.use('/api/posts/:post_id/favorite', postFavoriteRouter);

// Comment routes & nested resources
app.use('/api/comments', standaloneCommentRoutes);
app.use('/api/comments/:comment_id/like', commentLikeRouter);

// User Favorites route
app.use('/api/favorites', userFavoritesRouter);

// Notifications route
app.use('/api/notifications', notificationRoutes);

// Handle 404 for unknown endpoints
app.use((req, res, next) => {
  next(ApiError.notFound(`Cannot ${req.method} ${req.originalUrl}`));
});

// Central Error Handler Middleware
app.use(errorHandler);

// Start Server if launched directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`USOF Backend Server running on http://localhost:${PORT}`);
    console.log(`Static files served from http://localhost:${PORT}/uploads`);
  });
}

module.exports = app;
