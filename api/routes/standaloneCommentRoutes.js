const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

router.get('/:comment_id', commentController.getCommentById);
router.patch('/:comment_id', isAuthenticated, commentController.updateCommentStatus);
router.delete('/:comment_id', isAuthenticated, commentController.deleteComment);

module.exports = router;
