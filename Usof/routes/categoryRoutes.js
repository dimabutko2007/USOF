const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { isAuthenticated } = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');

// Public read endpoints
router.get('/', categoryController.getAllCategories);
router.get('/:category_id', categoryController.getCategoryById);
router.get('/:category_id/posts', categoryController.getPostsByCategory);

// Admin-only management endpoints
router.post('/', isAuthenticated, checkRole('admin'), categoryController.createCategory);
router.patch('/:category_id', isAuthenticated, checkRole('admin'), categoryController.updateCategory);
router.delete('/:category_id', isAuthenticated, checkRole('admin'), categoryController.deleteCategory);

module.exports = router;
