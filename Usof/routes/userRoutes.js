const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated } = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.get('/', isAuthenticated, userController.getAllUsers);
router.get('/:user_id', userController.getUserById);
router.post('/', isAuthenticated, checkRole('admin'), userController.createUser);
router.patch('/avatar', isAuthenticated, upload.single('avatar'), userController.uploadAvatar);
router.patch('/:user_id', isAuthenticated, userController.updateUser);
router.delete('/:user_id', isAuthenticated, userController.deleteUser);

module.exports = router;
