const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

// GET /api/subscriptions - get current user's subscriptions (posts they subscribed to)
router.get('/', isAuthenticated, subscriptionController.getSubscriptions);

module.exports = router;