const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const subscriptionController = require('../controllers/subscriptionController');
const { isAuthenticated } = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');
const { uploadPostImages } = require('../middlewares/uploadMiddleware');

router.get('/', postController.getAllPosts);
router.get('/:post_id', postController.getPostById);
router.get('/:post_id/categories', postController.getPostCategories);
router.post('/', isAuthenticated, uploadPostImages.array('images', 5), postController.createPost);
router.patch('/:post_id', isAuthenticated, postController.updatePost);
router.patch('/:post_id/status', isAuthenticated, checkRole('admin'), postController.updateStatus);
router.delete('/:post_id', isAuthenticated, postController.deletePost);

router.post('/:post_id/subscribe', isAuthenticated, subscriptionController.subscribe);
router.delete('/:post_id/subscribe', isAuthenticated, subscriptionController.unsubscribe);

module.exports = router;
