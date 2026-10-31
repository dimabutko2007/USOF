const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

router.get('/', isAuthenticated, subscriptionController.getSubscriptions);

module.exports = router;