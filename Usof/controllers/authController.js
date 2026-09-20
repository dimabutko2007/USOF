const authService = require('../services/authService');

class AuthController {
  async register(req, res, next) {
    try {
      const { login, password, passwordConfirmation, full_name, email } = req.body;
      const result = await authService.register({
        login,
        password,
        passwordConfirmation,
        full_name,
        email
      });
      res.status(201).json({ status: 'success', ...result });
    } catch (error) {
      next(error);
    }
  }

  async confirmEmail(req, res, next) {
    try {
      const { confirm_token } = req.params;
      const result = await authService.confirmEmail(confirm_token);
      res.status(200).json({ status: 'success', ...result });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { login, email, password } = req.body;
      const loginOrEmail = login || email;
      const user = await authService.login(loginOrEmail, password);

      // Save user session
      req.session.user = user;

      res.status(200).json({
        status: 'success',
        message: 'Logged in successfully.',
        user
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      if (!req.session) {
        return res.status(200).json({ status: 'success', message: 'Logged out successfully.' });
      }

      req.session.destroy((err) => {
        if (err) {
          return next(err);
        }
        res.clearCookie('connect.sid');
        return res.status(200).json({ status: 'success', message: 'Logged out successfully.' });
      });
    } catch (error) {
      next(error);
    }
  }

  async requestPasswordReset(req, res, next) {
    try {
      const { email } = req.body;
      const result = await authService.requestPasswordReset(email);
      res.status(200).json({ status: 'success', ...result });
    } catch (error) {
      next(error);
    }
  }

  async confirmPasswordReset(req, res, next) {
    try {
      const { confirm_token } = req.params;
      const { password, passwordConfirmation } = req.body;
      const result = await authService.confirmPasswordReset(confirm_token, password, passwordConfirmation);
      res.status(200).json({ status: 'success', ...result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
