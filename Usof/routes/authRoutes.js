const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

router.post('/register', authController.register);
router.get('/confirm-email/:confirm_token', authController.confirmEmail);
router.post('/login', authController.login);
router.post('/logout', isAuthenticated, authController.logout);
router.post('/password-reset', authController.requestPasswordReset);
router.post('/password-reset/:confirm_token', authController.confirmPasswordReset);

module.exports = router;
