const express = require('express');
const router = express.Router({ mergeParams: true });
const commentController = require('../controllers/commentController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

// Post-level comment routes (when mounted on /api/posts/:post_id/comments)
router.get('/', commentController.getCommentsByPostId);
router.post('/', isAuthenticated, commentController.createComment);

module.exports = router;
