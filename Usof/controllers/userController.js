const userService = require('../services/userService');

class UserController {
  async getAllUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json({ status: 'success', users });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const { user_id } = req.params;
      const user = await userService.getUserById(user_id);
      res.status(200).json({ status: 'success', user });
    } catch (error) {
      next(error);
    }
  }

  async createUser(req, res, next) {
    try {
      const { login, password, full_name, email, role } = req.body;
      const newUser = await userService.createUserByAdmin({
        login,
        password,
        full_name,
        email,
        role
      });
      res.status(201).json({ status: 'success', user: newUser });
    } catch (error) {
      next(error);
    }
  }

  async uploadAvatar(req, res, next) {
    try {
      const userId = req.session.user.id;
      const result = await userService.updateAvatar(userId, req.file);

      // Update active session profile picture
      req.session.user.profile_picture = result.profile_picture;

      res.status(200).json({ status: 'success', ...result });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const { user_id } = req.params;
      const { login, full_name, email, role } = req.body;
      const updatedUser = await userService.updateUserProfile(
        user_id,
        { login, full_name, email, role },
        req.session.user
      );

      // If user updated their own profile, update session
      if (req.session.user.id === parseInt(user_id, 10)) {
        req.session.user.login = updatedUser.login;
        req.session.user.full_name = updatedUser.full_name;
        req.session.user.email = updatedUser.email;
        req.session.user.role = updatedUser.role;
      }

      res.status(200).json({ status: 'success', user: updatedUser });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const { user_id } = req.params;
      const result = await userService.deleteUser(user_id, req.session.user);

      // If user deleted their own account, destroy session
      if (req.session.user.id === parseInt(user_id, 10)) {
        req.session.destroy();
        res.clearCookie('connect.sid');
      }

      res.status(200).json({ status: 'success', ...result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
