const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

router.get('/', isAuthenticated, notificationController.getUserNotifications);
router.patch('/:notification_id/read', isAuthenticated, notificationController.markAsRead);

module.exports = router;
